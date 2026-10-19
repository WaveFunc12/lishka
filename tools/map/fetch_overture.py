"""Pull Overture Maps features inside Israel's box into one parquet file.

Usage: python3 fetch_overture.py <listing> <out.parquet> <columns> "class=a|b"
<listing> holds one S3 key per line for a theme (for example
release/2026-09-23.1/theme=transportation/type=segment/). Only row groups whose
bbox statistics touch the box are downloaded. build_overlays.py expects
roads.parquet (segments, class=motorway|trunk|primary|secondary) and
water.parquet (water, class=river|stream) in the same folder.
"""
import sys, os, json, concurrent.futures as cf
import fsspec, pyarrow.parquet as pq, pyarrow as pa
if os.path.exists('/root/.ccr/ca-bundle.crt'):
    os.environ.setdefault('SSL_CERT_FILE', '/root/.ccr/ca-bundle.crt')
B = 'https://overturemaps-us-west-2.s3.us-west-2.amazonaws.com/'
listing, out, want_cols, keep = sys.argv[1], sys.argv[2], sys.argv[3].split(','), sys.argv[4]
X0, X1, Y0, Y1 = 34.1, 36.1, 29.4, 33.5
fs = fsspec.filesystem('http', client_kwargs={'trust_env': True}, block_size=2**20)
files = [l.split()[0] for l in open(listing) if l.strip()]

def scan(key):
    try:
        f = fs.open(B + key, 'rb')
        pf = pq.ParquetFile(f)
        md = pf.metadata
        names = [md.schema.column(i).path for i in range(md.num_columns)]
        ix = {n: names.index(n) for n in ['bbox.xmin', 'bbox.xmax', 'bbox.ymin', 'bbox.ymax']}
        hit = []
        for g in range(md.num_row_groups):
            rg = md.row_group(g)
            st = {k: rg.column(i).statistics for k, i in ix.items()}
            if st['bbox.xmin'].min < X1 and st['bbox.xmax'].max > X0 and st['bbox.ymin'].min < Y1 and st['bbox.ymax'].max > Y0:
                hit.append(g)
        if not hit:
            return None
        t = pf.read_row_groups(hit, columns=want_cols + ['bbox'])
        return t
    except Exception as e:
        print('ERR', key, e, file=sys.stderr)
        return None

tables = []
with cf.ThreadPoolExecutor(8) as ex:
    for i, t in enumerate(ex.map(scan, files)):
        if t is not None:
            tables.append(t)
            print('file', i, t.num_rows, file=sys.stderr)
t = pa.concat_tables(tables)
import pyarrow.compute as pc
b = t.column('bbox')
m = pc.and_(pc.and_(pc.less(pc.struct_field(b, 'xmin'), X1), pc.greater(pc.struct_field(b, 'xmax'), X0)),
            pc.and_(pc.less(pc.struct_field(b, 'ymin'), Y1), pc.greater(pc.struct_field(b, 'ymax'), Y0)))
t = t.filter(m)
k, v = keep.split('=')
if k:
    t = t.filter(pc.is_in(t.column(k), value_set=pa.array(v.split('|'))))
pq.write_table(t, out)
print('rows', t.num_rows)
