"""Build the map overlays: numbered main roads, named streams and region names.

Inputs (from tools/map/fetch_overture.py, Overture Maps data derived from OpenStreetMap):
  <cache>/roads.parquet  motorway..secondary road segments around Israel
  <cache>/water.parquet  river/stream lines around Israel
Overture drops most route numbers, so each numbered road is traced here: the cheapest path
through the road network between waypoints known to be on that road, preferring bigger roads.
Output: src/data/overlay.json (paths in map km). The app places the labels itself, on whatever part is on screen.

  python3 tools/map/build_overlays.py <cache_dir>
"""
import heapq, json, math, os, re, sys
import numpy as np, pyarrow.parquet as pq, shapely
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra
from scipy.spatial import cKDTree
from shapely.geometry import LineString, Polygon, box
from shapely.ops import unary_union, linemerge

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CACHE = sys.argv[1]
LON0, LAT0, KX, KY = 35.0, 31.5, 94.9186, 110.5706
km = lambda lon, lat: ((lon - LON0) * KX, -(lat - LAT0) * KY)

# Numbered roads: waypoints (lat, lon) in order along the road.
ROUTES = {
    '1': [(32.050, 34.800), (31.990, 34.885), (31.840, 34.975), (31.800, 35.100), (31.790, 35.200), (31.780, 35.300), (31.800, 35.500)],
    '2': [(32.145, 34.808), (32.320, 34.870), (32.440, 34.900), (32.600, 34.950), (32.770, 34.970)],
    '3': [(31.680, 34.620), (31.730, 34.750), (31.800, 34.850), (31.845, 34.960), (31.890, 35.000)],
    '4': [(31.600, 34.570), (31.660, 34.600), (31.800, 34.680), (31.870, 34.750), (31.990, 34.830), (32.080, 34.840), (32.180, 34.880), (32.440, 34.930)],
    '4N': [(32.800, 35.030), (32.920, 35.090), (33.010, 35.100), (33.080, 35.110)],
    '5': [(32.120, 34.830), (32.110, 34.960), (32.100, 35.170)],
    '6': [(31.380, 34.830), (31.604, 34.813), (31.700, 34.822), (31.785, 34.832), (31.950, 34.940), (32.110, 34.960), (32.200, 34.980), (32.480, 35.030), (32.640, 35.105)],
    '20': [(32.000, 34.790), (32.074, 34.795), (32.145, 34.810)],
    '25': [(31.250, 34.800), (31.070, 35.030), (30.981, 35.306)],
    '31': [(31.320, 34.900), (31.260, 35.210), (31.150, 35.360)],
    '35': [(31.660, 34.600), (31.610, 34.770), (31.530, 35.100)],
    '38': [(31.790, 35.000), (31.750, 34.990), (31.690, 34.960)],
    '40': [(32.170, 34.910), (32.080, 34.900), (31.950, 34.900), (31.920, 34.870), (31.730, 34.750), (31.610, 34.770), (31.270, 34.790), (30.610, 34.800), (29.970, 35.060)],
    '44': [(32.000, 34.800), (31.930, 34.870), (31.790, 34.990)],
    '57': [(32.310, 34.870), (32.310, 35.030), (32.220, 35.260)],
    '60': [(31.270, 34.800), (31.530, 35.100), (31.650, 35.120), (31.760, 35.200), (31.950, 35.230), (32.100, 35.250), (32.210, 35.270), (32.460, 35.300), (32.610, 35.290), (32.700, 35.300)],
    '65': [(32.450, 34.940), (32.500, 35.050), (32.580, 35.180), (32.610, 35.290), (32.780, 35.400), (32.920, 35.530)],
    '70': [(32.660, 35.100), (32.800, 35.110), (32.950, 35.160), (33.070, 35.140)],
    '75': [(32.790, 35.050), (32.710, 35.200), (32.700, 35.300)],
    # From Hamovil only: west of it OSM names the main road 79, so we don't guess which number it carries.
    '77': [(32.760, 35.240), (32.782, 35.330), (32.780, 35.400), (32.790, 35.520)],
    '85': [(32.930, 35.090), (32.920, 35.300), (32.920, 35.530)],
    '90': [(33.270, 35.580), (33.200, 35.570), (32.970, 35.560), (32.790, 35.530), (32.500, 35.500), (31.860, 35.460), (31.500, 35.390), (31.200, 35.360), (30.600, 35.170), (29.560, 34.950)],
    '98': [(32.683, 35.660), (32.820, 35.800), (32.980, 35.770), (33.270, 35.770)],
}
COST = {'motorway': 1.0, 'trunk': 1.0, 'primary': 1.35, 'secondary': 2.2}
# Roads that run right beside Route 6 and would otherwise be routed onto it.
NO_MOTORWAY = {'40', '70'}

# Streams: the big ones show from further out (level 0), the rest only when zoomed in.
STREAMS0 = ['נהר הירדן', 'נחל ירקון', 'נחל קישון', 'נחל אלכסנדר', 'נחל חדרה', 'נחל שורק', 'נחל לכיש', 'נחל הבשור', 'נחל איילון', 'נחל צין', 'נחל שקמה']
STREAMS1 = ['נחל פולג', 'נחל תנינים', 'נחל נעמן', 'נחל חרוד', 'נחל תבור', 'נחל ציפורי', 'נחל כזיב', 'נחל געתון', 'נחל גרר', 'נחל פארן', 'נחל האלה', 'נחל גוברין',
            'נחל באר שבע', 'נחל חברון', 'נחל צאלים', 'נחל ערוגות', 'נחל דליה', 'נחל עמוד', 'נחל שילה', 'נחל קדרון', 'נחל רמון', 'נחל ניצנה', 'נחל דישון', 'נחל עירון']

# Region names: (name, lat, lon, size) with size 0 = largest, 1 = medium, 2 = smallest (a valley like Jezreel).
REGIONS = [
    ('הגליל העליון', 33.02, 35.42, 0), ('הגליל התחתון', 32.74, 35.38, 1), ('הגליל המערבי', 32.97, 35.17, 1),
    ('רמת הגולן', 32.95, 35.76, 0), ('עמק החולה', 33.12, 35.61, 2), ('עמק יזרעאל', 32.62, 35.24, 2),
    ('עמק זבולון', 32.84, 35.10, 2), ('עמק הירדן', 32.66, 35.57, 2), ('עמק המעיינות', 32.48, 35.49, 2),
    ('הכרמל', 32.70, 35.03, 1), ('חוף הכרמל', 32.60, 34.93, 2), ('רמות מנשה', 32.58, 35.07, 2), ('ואדי ערה', 32.47, 35.10, 2),
    ('השרון', 32.27, 34.93, 0), ('עמק חפר', 32.38, 34.94, 2), ('גוש דן', 32.04, 34.84, 1),
    ('השפלה', 31.78, 34.88, 0), ('הרי ירושלים', 31.78, 35.07, 1), ('השומרון', 32.18, 35.22, 0),
    ('יהודה', 31.50, 35.08, 0), ('מדבר יהודה', 31.55, 35.31, 1), ('בקעת הירדן', 32.08, 35.50, 1),
    ('מישור החוף הדרומי', 31.62, 34.64, 1), ('חבל לכיש', 31.55, 34.82, 2), ('רצועת עזה', 31.42, 34.38, 1),
    ('בקעת באר שבע', 31.22, 34.95, 2), ('הנגב', 30.95, 34.80, 0), ('הר הנגב', 30.60, 34.90, 1),
    ('הערבה', 30.30, 35.12, 0),
]

def load(name):
    t = pq.read_table(os.path.join(CACHE, name)).to_pylist()
    for r in t:
        r['geom'] = shapely.from_wkb(r['geometry'])
    return t

def home_area():
    g = json.load(open(os.path.join(ROOT, 'src/data/geo.json')))
    polys = []
    for d in g['homeLow']:
        for sub in re.split(r'(?=M)', d):
            pts = [(float(a), float(b)) for a, b in re.findall(r'(-?[\d.]+) (-?[\d.]+)', sub)]
            if len(pts) > 2:
                polys.append(Polygon(pts).buffer(0))
    return unary_union(polys)

def to_km(g):
    return shapely.transform(g, lambda c: np.column_stack([(c[:, 0] - LON0) * KX, -(c[:, 1] - LAT0) * KY]))

def path_d(line, tol):
    line = line.simplify(tol)
    parts = getattr(line, 'geoms', [line])
    return ''.join('M' + 'L'.join(f'{x:.2f} {y:.2f}' for x, y in p.coords) for p in parts if len(p.coords) > 1)

def trace_routes(roads, home):
    zone = home.buffer(1.5)
    keyid, xs, ys = {}, [], []
    edges = []
    main = []
    for r in roads:
        g = to_km(r['geom'])
        if not zone.intersects(g):
            continue
        cs = list(g.coords)
        ids = []
        for c in cs:
            k = (round(c[0], 4), round(c[1], 4))
            if k not in keyid:
                keyid[k] = len(xs); xs.append(k[0]); ys.append(k[1]); main.append(False)
            ids.append(keyid[k])
        w = COST[r['class']]
        for a, b in zip(ids, ids[1:]):
            if a != b:
                edges.append((a, b, w * math.dist((xs[a], ys[a]), (xs[b], ys[b])), r['class'] == 'motorway'))
        if r['class'] in ('motorway', 'trunk', 'primary'):
            for i in ids:
                main[i] = True
    n = len(xs)
    a, b, w, mw = map(np.array, zip(*edges))
    graph = lambda w: coo_matrix((np.r_[w, w], (np.r_[a, b], np.r_[b, a])), shape=(n, n)).tocsr()
    G_all, G_nomw = graph(w), graph(np.where(mw, w * 6, w))
    pts = np.column_stack([xs, ys])
    mi = np.flatnonzero(main)
    tree = cKDTree(pts[mi])
    out = []
    for ref, wps in ROUTES.items():
        G = G_nomw if ref in NO_MOTORWAY else G_all
        nodes = [mi[tree.query(km(lon, lat))[1]] for lat, lon in wps]
        seq = []
        for s, t in zip(nodes, nodes[1:]):
            _, pred = dijkstra(G, indices=s, return_predecessors=True, limit=400)
            if pred[t] < 0:
                raise SystemExit(f'route {ref}: no road path between waypoints near {pts[s]} and {pts[t]}')
            p, cur = [], t
            while cur != s:
                p.append(cur); cur = pred[cur]
            p.append(s)
            seq += p[::-1][1 if seq else 0:]
        # Drop out-and-back spurs where a waypoint snapped to a side road.
        st = []
        for v in seq:
            if len(st) >= 2 and st[-2] == v:
                st.pop()
            elif not st or st[-1] != v:
                st.append(v)
        line = LineString(pts[st])
        label = ref.rstrip('N')
        out.append({'ref': label, 'd': path_d(line, 0.05), 'km': round(line.length)})
        print(f'route {ref}: {line.length:.0f} km')
    return out

NET_CLASSES = ['motorway', 'trunk', 'primary', 'secondary']
CELL = 16  # km; the app draws only the cells in view

def rel_d(g, tol, min_len=0.0):
    """SVG path in 10 m units with relative steps: compact, and the app scales it by 0.01."""
    out = []
    for p in getattr(g.simplify(tol), 'geoms', [g.simplify(tol)]):
        if p.geom_type != 'LineString' or p.length < min_len or len(p.coords) < 2:
            continue
        q = np.round(np.asarray(p.coords) * 100).astype(int)
        q = q[np.r_[True, np.any(np.diff(q, axis=0) != 0, axis=1)]]
        if len(q) < 2:
            continue
        dq = np.diff(q, axis=0)
        out.append(f'M{q[0][0]} {q[0][1]}l' + ' '.join(f'{a} {b}' for a, b in dq))
    return ''.join(out)

def network(roads, home):
    """Every motorway, trunk, primary and secondary road inside the country, at two levels of detail.
    lod 0 (zoomed out): simplified to 120 m, short bits dropped. lod 1 (zoomed in): 8 m, cut into cells."""
    zone = home.buffer(1.5)
    out = []
    for ci, cls in enumerate(NET_CLASSES):
        u = unary_union([to_km(r['geom']) for r in roads if r['class'] == cls]).intersection(zone)
        m = linemerge(u) if u.geom_type == 'MultiLineString' else u
        if ci < 3:
            d = rel_d(m, 0.12)
            out.append({'c': ci, 'l': 0, 'x': 0, 'y': 0, 'd': d})
        x0, y0, x1, y1 = m.bounds
        for cx in range(int(math.floor(x0 / CELL)), int(math.ceil(x1 / CELL))):
            for cy in range(int(math.floor(y0 / CELL)), int(math.ceil(y1 / CELL))):
                part = m.intersection(box(cx * CELL, cy * CELL, (cx + 1) * CELL, (cy + 1) * CELL))
                if part.is_empty:
                    continue
                part = linemerge(part) if part.geom_type == 'MultiLineString' else part
                d = rel_d(part, 0.008, 0.05)
                if d:
                    out.append({'c': ci, 'l': 1, 'x': cx * CELL, 'y': cy * CELL, 'd': d})
        print(f'net {cls}: {m.length:.0f} km')
    return out

def lakes():
    g = json.load(open(os.path.join(ROOT, 'src/data/geo.json')))
    polys = []
    for d in g['lakes']:
        for sub in re.split(r'(?=M)', d):
            pts = [(float(a), float(b)) for a, b in re.findall(r'(-?[\d.]+) (-?[\d.]+)', sub)]
            if len(pts) > 2:
                polys.append(Polygon(pts).buffer(0))
    return unary_union(polys)

def streams(water, home):
    zone = home.buffer(0.5).difference(lakes())  # a river stops at the lake shore
    by = {}
    for r in water:
        n = r['names'] or {}
        he = [v for k, v in (n.get('common') or []) if k == 'he']
        name = he[0] if he else None
        if name in STREAMS0 or name in STREAMS1:
            by.setdefault(name, []).append(to_km(r['geom']))
    out = []
    for name, gs in by.items():
        u = unary_union(gs)
        g = (linemerge(u) if u.geom_type == 'MultiLineString' else u).intersection(zone)
        if g.is_empty or g.length < 5:
            continue
        out.append({'name': name, 'level': 0 if name in STREAMS0 else 1, 'd': path_d(g, 0.05), 'f': rel_d(g, 0.008)})
        print(f'stream {name}: {g.length:.0f} km')
    return out

def main():
    home = home_area()
    roads = [r for r in load('roads.parquet') if r['class'] in COST]
    data = {
        'roads': trace_routes(roads, home),
        'streams': streams(load('water.parquet'), home),
        'regions': [{'name': n, 'x': round(km(lon, lat)[0], 1), 'y': round(km(lon, lat)[1], 1), 'size': s} for n, lat, lon, s in REGIONS],
    }
    f = os.path.join(ROOT, 'src/data/overlay.json')
    json.dump(data, open(f, 'w'), ensure_ascii=False, separators=(',', ':'))
    print(f'overlay {os.path.getsize(f) / 1e3:.0f} KB')
    f = os.path.join(ROOT, 'src/data/roadnet.json')
    json.dump(network(roads, home), open(f, 'w'), separators=(',', ':'))
    print(f'roadnet {os.path.getsize(f) / 1e3:.0f} KB')

if __name__ == '__main__':
    main()
