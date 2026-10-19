"""Build src/data/places.json from the CBS top-500 list.

    python3 tools/places/build_places.py /mnt/project-files/lishka-data/cbs/places-top500.json

The 42 story places (tools/places/story.json) keep their ids, names, hints and postcards.
Every other place gets id c<CBS code> and goes to a regional postcard: CBS subdistricts are grouped
into the game's regions (REGIONS in src/engine/content.ts, same ids), each region's places are
ordered by population and split into postcards of 4 to 6.
"""
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'src/data/places.json'
STORY = Path(__file__).with_name('story.json')

# Game region -> CBS subdistricts (נפות). Keep in step with REGIONS in content.ts.
REGIONS = {
    'dan': ['תל אביב'],
    'shr': ['השרון'],
    'ptk': ['פתח תקווה'],
    'shf': ['רמלה', 'רחובות'],
    'hfa': ['חיפה'],
    'jrs': ['ירושלים'],
    'emk': ['יזרעאל'],
    'wgl': ['עכו'],
    'ugl': ['צפת', 'כנרת'],
    'hdr': ['חדרה'],
    'dch': ['אשקלון'],
    'ngv': ['באר שבע'],
    'smr': ['טול כרם', 'שכם', "ג'נין"],
    'bnm': ['ראמאללה', 'בית לחם', 'חברון', 'ירדן-יריחו'],
    'gol': ['גולן'],
}
SUB_TO_REGION = {sub: r for r, subs in REGIONS.items() for sub in subs}
# Spoken name of each region, for hints written when there is no hook.
REGION_IN = {
    'dan': 'בגוש דן', 'shr': 'בשרון', 'ptk': 'ליד פתח תקווה', 'shf': 'בשפלה', 'hfa': 'באזור חיפה והכרמל',
    'jrs': 'באזור ירושלים', 'emk': 'בעמקים ובגליל התחתון', 'wgl': 'בגליל המערבי', 'ugl': 'בגליל העליון',
    'hdr': 'באזור חדרה ואדי ערה', 'dch': 'במישור החוף הדרומי', 'ngv': 'בנגב', 'smr': 'בשומרון',
    'bnm': 'בבנימין וביהודה', 'gol': 'ברמת הגולן',
}
# The story uses the everyday spelling of a few names; CBS spells them in full.
SAME = {'הרצליה': 'הרצלייה', 'נהריה': 'נהרייה'}
# Hooks that were matched to the wrong place (the moshava got Yokneam Illit's).
HOOK_FIX = {'יקנעם (מושבה)': 'המושבה הוותיקה שלמרגלות יקנעם עילית, בפתח עמק יזרעאל'}


def km(lat, lon):
    return round((lon - 35) * 94.9186, 2), round(-(lat - 31.5) * 110.5706, 2)


def district(p):
    d = p['district_he']
    return d if d.startswith('אזור') else 'מחוז ' + d


def pop_text(n):
    if n >= 10000:
        return f'כ־{round(n / 1000):,} אלף תושבים'
    return f'כ־{round(n, -2):,} תושבים'


def split(n, size=6):
    """Postcard sizes for n places: as even as possible, at most `size` each."""
    k = max(1, math.ceil(n / size))
    return [n // k + (1 if i < n % k else 0) for i in range(k)]


def main(src):
    cbs = json.load(open(src))
    story = json.load(open(STORY))
    by_name = {p['name_he']: p for p in cbs}
    out, used = [], set()
    for s in story:
        c = by_name.get(SAME.get(s['name'], s['name']))
        if not c:
            sys.exit(f'story place not in CBS list: {s["name"]}')
        used.add(c['cbs_code'])
        alias = sorted(set(s['alias'] + c.get('aliases_he', []) + [c['name_he']]) - {s['name']})
        out.append(place(c, s['id'], s['name'], alias, s['hint'], s['unit']))
        if 'short' in s:
            out[-1]['short'] = s['short']

    rest = [c for c in cbs if c['cbs_code'] not in used]
    for r in REGIONS:
        mine = sorted((c for c in rest if SUB_TO_REGION.get(c['subdistrict_he']) == r), key=lambda c: -c['population'])
        i = 0
        for n, size in enumerate(split(len(mine)), 1):
            for c in mine[i:i + size]:
                hint = HOOK_FIX.get(c['name_he']) or c.get('hook_he') or f'{c["type_he"]} {REGION_IN[r]}, {pop_text(c["population"])}.'
                out.append(place(c, 'c' + c['cbs_code'], c['name_he'], sorted(set(c.get('aliases_he', [])) - {c['name_he']}), hint, f'{r}{n}'))
            i += size
    missing = [c['name_he'] for c in rest if c['subdistrict_he'] not in SUB_TO_REGION]
    if missing:
        sys.exit(f'no region for: {missing}')
    ids = [p['id'] for p in out]
    assert len(ids) == len(set(ids)), 'duplicate ids'
    json.dump(out, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
    print(f'{len(out)} places -> {OUT.relative_to(ROOT)}')


def place(c, pid, name, alias, hint, unit):
    x, y = km(c['lat'], c['lon'])
    return {
        'id': pid, 'name': name, 'alias': alias, 'lat': c['lat'], 'lon': c['lon'], 'x': x, 'y': y,
        'type': c['type_he'], 'district': district(c), 'hint': hint.rstrip('.'), 'unit': unit,
        'pop': c['population'], 'rank': c['rank'], 'region': SUB_TO_REGION[c['subdistrict_he']],
    }


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '/mnt/project-files/lishka-data/cbs/places-top500.json')
