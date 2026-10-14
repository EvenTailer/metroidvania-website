import { NarrativeChapter } from './types';

export async function fetchNarrativeFromServer(): Promise<NarrativeChapter[]> {
  const res = await fetch('/api/narrative.php', {
    headers: { credentials: 'omit' }
  });
  if (!res.ok) {
    throw new Error(`Narrative fetch failed: ${res.status}`);
  }
  const data = (await res.json()) as { chapters?: NarrativeChapter[] };
  return Array.isArray(data.chapters) ? data.chapters : [];
}

export async function saveNarrativeToServer(chapters: NarrativeChapter[]): Promise<void> {
  const res = await fetch('/api/narrative.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chapters })
  });
  if (!res.ok) {
    throw new Error(`Narrative save failed: ${res.status}`);
  }
}
