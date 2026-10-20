"""Build the terrain basemap: shaded-relief image tiles + a detailed coastline.

Inputs: Copernicus DEM GLO-90 tiles (free, public, downloaded on first run) and the
coarse outlines in src/data/geo.json. Outputs: assets/map/*.jpg, src/ui/mapTiles.ts and
the detailed `home`/`lakes` paths in src/data/geo.json. No names, roads or built-up areas
are drawn, so the map never gives away where a place is.

  python3 tools/map/build.py [cache_dir]
Needs numpy, pillow, scipy, scikit-image, shapely, tifffile, imagecodecs.
"""
import json, os, re, sys, urllib.request
import numpy as np, tifffile
from PIL import Image, ImageDraw
from scipy import ndimage
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import unary_union
from skimage import measure

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '.map-cache')
GEO = os.path.join(ROOT, 'src/data/geo.json')
OUT = os.path.join(ROOT, 'assets/map')

# Map km <-> lat/lon (the prototype's equirectangular projection).
LON0, LAT0, KX, KY = 35.0, 31.5, 94.9186, 110.5706
BOX = (-120, -250, 260, 510)         # imagery: COUNTRY in content.ts plus a margin of neighbours
R = 16                               # px per km for the detailed tiles
TILE = 512                           # px
OVERVIEW_R = 3                       # px per km for the whole-country image
WIDE_BOX = (-250, -270, 520, 560)     # a coarse image of the wider region, so wide views have no edge
WIDE_R = 2
SEA = (0x2E, 0x9C, 0xA8)
LAND = np.array([0xF6, 0xE3, 0xBA], float)
NB = np.array([0xD8, 0xC4, 0x9A], float)
HIGH = np.array([0xE4, 0xC4, 0x8E], float)   # tint for high ground

def dem_mosaic():
    os.makedirs(CACHE, exist_ok=True)
    lats, lons = range(28, 34), range(32, 38)
    big = np.zeros((len(lats) * 1200, len(lons) * 1200), np.float32)
    for i, la in enumerate(reversed(lats)):
        for j, lo in enumerate(lons):
            n = f'Copernicus_DSM_COG_30_N{la:02d}_00_E{lo:03d}_00_DEM'
            f = os.path.join(CACHE, n + '.tif')
            if not os.path.exists(f):
                try:
                    urllib.request.urlretrieve(f'https://copernicus-dem-90m.s3.amazonaws.com/{n}/{n}.tif', f)
                except Exception:
                    open(f, 'wb').close()          # open sea: no tile published
            if os.path.getsize(f) < 1000:
                continue
            a = tifffile.imread(f)
            big[i * 1200:(i + 1) * 1200, j * 1200:(j + 1) * 1200] = a
    # (row 0 = lat 34, col 0 = lon 32), 1/1200 degree per pixel
    return big, 34.0, 32.0

def resample(dem, top, left, r, box=BOX):
    x0, y0, w, h = box
    xs = x0 + (np.arange(w * r) + 0.5) / r
    ys = y0 + (np.arange(h * r) + 0.5) / r
    lon = LON0 + xs / KX
    lat = LAT0 - ys / KY
    rows = (top - lat) * 1200 - 0.5
    cols = (lon - left) * 1200 - 0.5
    rr, cc = np.meshgrid(rows, cols, indexing='ij')
    return ndimage.map_coordinates(dem, [rr, cc], order=3, mode='nearest')

def paths(name):
    g = json.load(open(GEO))
    out = []
    for d in g.get(name) or g[name.replace('Low', '')]:
        for sub in re.split(r'(?=M)', d):
            pts = [(float(a), float(b)) for a, b in re.findall(r'(-?[\d.]+) (-?[\d.]+)', sub)]
            if len(pts) > 2:
                out.append(Polygon(pts).buffer(0))
    return out

def raster(polys, r, shape, box=BOX):
    x0, y0, _, _ = box
    im = Image.new('L', (shape[1], shape[0]), 0)
    d = ImageDraw.Draw(im)
    for p in polys:
        for g in getattr(p, 'geoms', [p]):
            d.polygon([((x - x0) * r, (y - y0) * r) for x, y in g.exterior.coords], fill=255)
            for hole in g.interiors:
                d.polygon([((x - x0) * r, (y - y0) * r) for x, y in hole.coords], fill=0)
    return np.asarray(im) > 127

def water(z, r, lakes_coarse, box=BOX):
    """Sea = low ground connected to the open edges; lakes = flat water inside each coarse lake."""
    low = z <= 0.5
    lab, _ = ndimage.label(low)
    edge = set(np.unique(lab[:, 0])) | set(np.unique(lab[-1, :])) | set(np.unique(lab[0, :int(lab.shape[1] * .6)]))
    edge.discard(0)
    sea = np.isin(lab, list(edge))
    lake = np.zeros_like(sea)
    for p in lakes_coarse:
        inside = raster([p], r, z.shape, box)
        zone = raster([p.buffer(2.0)], r, z.shape, box)
        level = np.median(z[inside])
        flat = zone & (np.abs(z - level) < 1.5)
        lab, _ = ndimage.label(flat)
        ids, counts = np.unique(lab[inside & flat], return_counts=True)
        keep = ids[(ids > 0) & (counts > 0.2 * inside.sum() * 0 + 20)]
        got = np.isin(lab, keep)
        lake |= got if got.sum() > 0.5 * inside.sum() else inside
    lake = ndimage.binary_opening(lake, iterations=1)
    return sea, lake & ~sea

def shade(z, r, az=315, alt=45, exag=2.2):
    px = 1000 / r                                  # metres per pixel
    zs = ndimage.gaussian_filter(z, 0.6 * r / 11)  # soften the DSM's building/tree noise
    dy, dx = np.gradient(zs * exag, px)
    slope = np.arctan(np.hypot(dx, dy))
    aspect = np.arctan2(-dx, dy)
    a, h = np.radians(360 - az + 90), np.radians(alt)
    hs = np.sin(h) * np.cos(slope) + np.cos(h) * np.sin(slope) * np.cos(a - aspect)
    return hs / np.sin(h)                         # 1 = flat

def colour(z, hs, home, sea, lake):
    t = np.clip((z - 150) / 900, 0, 1)[..., None]
    base = np.where(home[..., None], LAND, NB)
    base = base * (1 - 0.45 * t) + HIGH * 0.45 * t * np.where(home[..., None], 1, 0.9)
    k = np.clip(1 + (hs - 1) * 0.55, 0.55, 1.18)[..., None]
    rgb = np.clip(base * k, 0, 255)
    rgb[sea | lake] = SEA
    return rgb.astype(np.uint8)

def to_path(mask, r, tol):
    x0, y0, _, _ = BOX
    m = np.pad(mask.astype(float), 1)
    polys = []
    for c in measure.find_contours(m, 0.5):
        pts = [(x0 + (cc - 1 + 0.5) / r, y0 + (rr - 1 + 0.5) / r) for rr, cc in c]
        if len(pts) > 3:
            polys.append(Polygon(pts))
    # even-odd: outer rings and holes
    polys.sort(key=lambda p: -p.area)
    shapes = []
    for p in polys:
        for i, s in enumerate(shapes):
            if s.contains(p.representative_point()):
                shapes[i] = s.difference(p)
                break
        else:
            shapes.append(p)
    out = []
    for s in shapes:
        s = s.simplify(tol, preserve_topology=True)
        for g in getattr(s, 'geoms', [s]):
            if g.area < 4 * tol * tol:
                continue
            d = ''
            for ring in [g.exterior, *g.interiors]:
                cs = list(ring.coords)[:-1]
                d += 'M' + 'L'.join(f'{x:.2f} {y:.2f}' for x, y in cs) + 'Z'
            out.append(d)
    return out

def main():
    dem, top, left = dem_mosaic()
    # Always start from the coarse source outlines, so the script can be re-run.
    home_c, lakes_c = paths('homeLow'), paths('lakesLow')
    nb_c = unary_union(paths('nb'))
    home_u = unary_union(home_c)
    # Coarse home, pushed out over the water so the DEM decides the real coastline.
    home_zone = unary_union([home_u, home_u.buffer(4).difference(nb_c)])

    z = resample(dem, top, left, R)
    sea, lake = water(z, R, lakes_c)
    home = raster([home_zone], R, z.shape) & ~sea
    rgb = colour(z, shade(z, R), home, sea, lake)

    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        os.remove(os.path.join(OUT, f))
    x0, y0, w, h = BOX
    tiles, size = [], 0
    for ty in range(0, rgb.shape[0], TILE):
        for tx in range(0, rgb.shape[1], TILE):
            # One pixel of the neighbours around each tile, so scaled-up tiles blend at their seams.
            a, b = max(ty - 1, 0), max(tx - 1, 0)
            part = rgb[a:ty + TILE + 1, b:tx + TILE + 1]
            if ((sea | lake)[ty:ty + TILE, tx:tx + TILE]).all():
                continue                                      # open sea: the background colour covers it
            name = f't{ty // TILE}_{tx // TILE}.jpg'
            Image.fromarray(part).save(os.path.join(OUT, name), quality=78, optimize=True, progressive=False)
            size += os.path.getsize(os.path.join(OUT, name))
            tiles.append((name, x0 + b / R, y0 + a / R, part.shape[1] / R, part.shape[0] / R))
    ov = Image.fromarray(rgb).resize((w * OVERVIEW_R, h * OVERVIEW_R), Image.LANCZOS)
    ov.save(os.path.join(OUT, 'overview.jpg'), quality=80, optimize=True)
    size += os.path.getsize(os.path.join(OUT, 'overview.jpg'))

    # The wider region, coarse: only seen at the edges of wide views, around the overview.
    zw = resample(dem, top, left, WIDE_R, WIDE_BOX)
    sea_w, lake_w = water(zw, WIDE_R, lakes_c, WIDE_BOX)
    home_w = raster([home_zone], WIDE_R, zw.shape, WIDE_BOX) & ~sea_w
    Image.fromarray(colour(zw, shade(zw, WIDE_R), home_w, sea_w, lake_w)).save(os.path.join(OUT, 'wide.jpg'), quality=72, optimize=True)
    size += os.path.getsize(os.path.join(OUT, 'wide.jpg'))

    # Detailed outlines from the same water mask, so lines and image agree.
    zc = resample(dem, top, left, 8)
    sea_c, lake_c = water(zc, 8, lakes_c)
    home_m = raster([home_zone], 8, zc.shape) & ~sea_c
    g = json.load(open(GEO))
    g.setdefault('homeLow', g['home'])
    g.setdefault('lakesLow', g['lakes'])
    g['home'] = to_path(ndimage.binary_closing(home_m, iterations=1), 8, 0.12)
    g['lakes'] = to_path(lake_c, 8, 0.1)
    json.dump(g, open(GEO, 'w'), ensure_ascii=False, separators=(',', ':'))

    with open(os.path.join(ROOT, 'src/ui/mapTiles.ts'), 'w') as f:
        f.write('/* Generated by tools/map/build.py. Shaded-relief basemap tiles, positioned in map km. */\n')
        f.write('export type Tile = { x: number; y: number; w: number; h: number; src: number };\n\n')
        fx, fy, fw, fh = WIDE_BOX
        f.write(f"export const WIDE: Tile = {{ x: {fx}, y: {fy}, w: {fw}, h: {fh}, src: require('../../assets/map/wide.jpg') }};\n")
        f.write(f"export const OVERVIEW: Tile = {{ x: {x0}, y: {y0}, w: {w}, h: {h}, src: require('../../assets/map/overview.jpg') }};\n")
        f.write(f'/** Detailed tiles, {R} px per km. Open sea has no tile. */\n')
        f.write(f'export const TILE_PX_PER_KM = {R};\n')
        f.write(f'export const OVERVIEW_PX_PER_KM = {OVERVIEW_R};\n')
        f.write('export const TILES: Tile[] = [\n')
        for n, x, y, tw, th in tiles:
            f.write(f"  {{ x: {x:g}, y: {y:g}, w: {tw:g}, h: {th:g}, src: require('../../assets/map/{n}') }},\n")
        f.write('];\n')
    print(f'{len(tiles)} tiles + overview, {size / 1e6:.1f} MB; home paths {sum(len(p) for p in g["home"]) / 1e3:.0f} KB')

if __name__ == '__main__':
    main()
