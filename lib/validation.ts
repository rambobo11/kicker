export const TITLE_MAX = 180;

export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function cleanTitle(value: string) {
  const title = value.trim().slice(0, TITLE_MAX);
  return title.length > 0 ? title : null;
}
