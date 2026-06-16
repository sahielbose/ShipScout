// Voyage embeddings (CONTEXT.md section 5). Raw fetch keeps the dependency
// surface small. Returns null when no key is set so callers fall back to
// lexical scoring. The dimension must match EMBEDDING_DIM and the schema.

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const MODEL = process.env.VOYAGE_MODEL || "voyage-3";

export function isVoyageAvailable(): boolean {
  return Boolean(process.env.VOYAGE_API_KEY);
}

export const EMBEDDING_DIM = Number(process.env.EMBEDDING_DIM || 1024);

interface VoyageResponse {
  data: { embedding: number[]; index: number }[];
}

// Embed one or more texts. inputType is "query" for search queries and
// "document" for stored capability/profile text (Voyage uses this asymmetry).
export async function embed(
  texts: string[],
  inputType: "query" | "document" = "document"
): Promise<number[][] | null> {
  if (!isVoyageAvailable() || texts.length === 0) return null;
  try {
    const res = await fetch(VOYAGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        input: texts,
        input_type: inputType,
        output_dimension: EMBEDDING_DIM,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as VoyageResponse;
    const sorted = json.data.sort((a, b) => a.index - b.index);
    return sorted.map((d) => d.embedding);
  } catch {
    return null;
  }
}

export async function embedOne(
  text: string,
  inputType: "query" | "document" = "document"
): Promise<number[] | null> {
  const out = await embed([text], inputType);
  return out ? out[0] : null;
}
