/**
 * Resolves Google Places photo resource names to short-lived CDN URLs.
 * Called server-side only (uses GOOGLE_API_KEY).
 */
export async function resolvePhotoUrls(
  photoNames: string[] | undefined,
  max = 3
): Promise<string[]> {
  const key = process.env.GOOGLE_API_KEY;
  if (!key || !photoNames?.length) return [];

  const urls: string[] = [];
  for (const name of photoNames.slice(0, max)) {
    if (!name) continue;
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/${name}/media?maxHeightPx=900&skipHttpRedirect=true`,
        { headers: { "X-Goog-Api-Key": key } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (data.photoUri) urls.push(data.photoUri);
    } catch {
      // skip failed photo
    }
  }
  return urls;
}
