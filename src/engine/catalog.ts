import placesJson from '../data/places.json';
import { UNIT_META } from './content';
import type { Place, Unit } from './types';

/* The prototype's 42 sample places. The real 500 come from the Gemini dataset in the same shape. */
export const PLACES: Place[] = placesJson as Place[];
export const BY: Record<string, Place> = Object.fromEntries(PLACES.map((p) => [p.id, p]));
export const UNITS: Unit[] = UNIT_META.map((u) => ({ ...u, items: PLACES.filter((p) => p.unit === u.id).map((p) => p.id) }));
/** The big cities every new place can be described against. */
export const ANCHORS: string[] = UNITS[0].items;
