export async function readJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error("Empty server response");
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid server response");
  }
}
