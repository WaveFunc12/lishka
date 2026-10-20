import { shuffle, type Rng } from './random';

/* The road quiz: one main road at a time is drawn on the map, and the player names its number.
   The routes are the numbered roads in src/data/overlay.json (built by tools/map/build_overlays.py). */

export type Route = { ref: string; name?: string; via: string };

/** Every numbered road on the map, with its common name where it has one and the places it links. */
export const ROUTES: Route[] = [
  { ref: '1', via: 'תל אביב, ירושלים וים המלח' },
  { ref: '2', name: 'כביש החוף', via: 'תל אביב, נתניה וחיפה' },
  { ref: '3', via: 'אשקלון, לטרון ומודיעין' },
  { ref: '4', via: 'ראש הנקרה, חיפה, בני ברק, אשדוד ואשקלון' },
  { ref: '5', name: 'חוצה שומרון', via: 'תל אביב ואריאל' },
  { ref: '6', name: 'חוצה ישראל', via: 'הגליל והנגב, ממזרח לגוש דן' },
  { ref: '20', name: 'נתיבי איילון', via: 'לב תל אביב, מהרצליה ועד ראשון לציון' },
  { ref: '25', via: 'באר שבע, דימונה והערבה' },
  { ref: '31', via: 'להבים, ערד וים המלח' },
  { ref: '35', via: 'אשקלון, קריית גת וחברון' },
  { ref: '38', via: 'אשתאול, בית שמש ובית גוברין' },
  { ref: '40', via: 'כפר סבא, רחובות, באר שבע ומצפה רמון' },
  { ref: '44', via: 'חולון, רמלה ואשתאול' },
  { ref: '57', via: 'נתניה, שכם ובקעת הירדן' },
  { ref: '60', name: 'דרך האבות', via: 'עפולה, ירושלים, חברון ובאר שבע' },
  { ref: '65', name: 'ואדי עארה', via: 'חדרה, עפולה וצומת גולני' },
  { ref: '70', via: 'זכרון יעקב, יקנעם, שפרעם ושלומי' },
  { ref: '75', name: 'דרך העמקים', via: 'חיפה ונצרת' },
  { ref: '77', via: 'צומת המוביל, צומת גולני וטבריה' },
  { ref: '85', via: 'עכו, כרמיאל וצומת עמיעד' },
  { ref: '90', name: 'הכביש הארוך בארץ', via: 'מטולה, בקעת הירדן, ים המלח ואילת' },
  { ref: '98', name: 'כביש הגולן', via: 'רמת הגולן מצפון לדרום' },
];

export const ROUTE_BY: Record<string, Route> = Object.fromEntries(ROUTES.map((r) => [r.ref, r]));

export const ROAD_QUIZ_N = 8;

export type RoadQuestion = { ref: string; choices: string[] };

/** A round of the road quiz: different roads, each with its number and two other numbers to choose from. */
export function roadQuiz(rng: Rng, n = ROAD_QUIZ_N): RoadQuestion[] {
  return shuffle(ROUTES.slice(), rng).slice(0, n).map((r) => ({
    ref: r.ref,
    choices: shuffle([r.ref, ...shuffle(ROUTES.filter((o) => o.ref !== r.ref).map((o) => o.ref), rng).slice(0, 2)], rng),
  }));
}

/** "כביש 6 · כביש חוצה ישראל", or just "כביש 40". */
export const routeTitle = (ref: string): string => {
  const r = ROUTE_BY[ref];
  return r?.name ? `כביש ${ref} · ${r.name}` : `כביש ${ref}`;
};
