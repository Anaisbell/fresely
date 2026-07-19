// Static Kitchen Wisdom tips for V1. No personalization, no persistence.
const TIPS: readonly string[] = [
  "Salt pasta water generously so the noodles are seasoned from within.",
  "Let cooked meat rest before slicing so more of the juices stay in the food.",
  "Taste as you go—it's easier to add seasoning than fix too much.",
  "Room-temperature eggs blend more evenly into batters.",
  "A sharp knife is safer than a dull one because it is less likely to slip.",
];

/**
 * Builds a local-calendar-date key (not UTC) so the tip changes at local
 * midnight rather than at a server or UTC boundary.
 */
function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
}

/**
 * Deterministic string hash, folded into a valid TIPS index. No randomness:
 * the same calendar-day key always produces the same index.
 */
function dateKeyToIndex(key: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % length;
  }
  return Math.abs(hash) % length;
}

/**
 * Returns one stable tip for the given local calendar day. Defaults to now.
 * The same tip is returned for every call within the same local day; it only
 * changes when the local date rolls over. No Math.random, no storage.
 */
export function getDailyTip(date: Date = new Date()): string {
  const key = localDateKey(date);
  const index = dateKeyToIndex(key, TIPS.length);
  return TIPS[index];
}
