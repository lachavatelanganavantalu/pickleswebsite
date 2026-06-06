/** Strip MongoDB `_id` and other non-JSON fields before Server → Client props. */
export function toPlainDocument<T>(doc: T): T {
  if (doc === null || typeof doc !== "object") return doc;
  const { _id: _ignored, ...rest } = doc as T & { _id?: unknown };
  return JSON.parse(JSON.stringify(rest)) as T;
}

export function toPlainDocuments<T>(docs: T[]): T[] {
  return docs.map(toPlainDocument);
}
