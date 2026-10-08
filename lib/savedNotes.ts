import type { SavedNote, AnalyzeResponse } from "@/types";

const PRIMARY_STORAGE_KEY = "videomind_saved_notes";
const LEGACY_STORAGE_KEY = "edurova_saved_notes";

function getLocalNotes(): SavedNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PRIMARY_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalNotes(notes: SavedNote[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.warn("Failed to write to localStorage:", err);
  }
}

/**
 * Saves a video analysis to the local browser library.
 */
export async function saveNoteToLibrary(
  dataOrUserId: AnalyzeResponse | string | undefined,
  maybeData?: AnalyzeResponse
): Promise<SavedNote> {
  const data = (maybeData || dataOrUserId) as AnalyzeResponse;
  const note: SavedNote = {
    id: data.videoInfo.id,
    videoId: data.videoInfo.id,
    videoInfo: data.videoInfo,
    analysis: data.analysis,
    transcript: data.transcript,
    rawTranscript: data.rawTranscript,
    savedAt: Date.now(),
  };

  const current = getLocalNotes();
  const filtered = current.filter((n) => n.videoId !== note.videoId);
  const updated = [note, ...filtered];
  setLocalNotes(updated);

  return note;
}

/**
 * Retrieves all saved notes from local browser library.
 */
export async function getSavedNotesFromLibrary(
  _userId?: string
): Promise<SavedNote[]> {
  return getLocalNotes();
}

/**
 * Removes a note from the local library.
 */
export async function deleteNoteFromLibrary(
  videoIdOrUserId: string | undefined,
  maybeVideoId?: string
): Promise<void> {
  const videoId = maybeVideoId || videoIdOrUserId;
  if (!videoId) return;
  const current = getLocalNotes();
  const updated = current.filter((n) => n.videoId !== videoId);
  setLocalNotes(updated);
}

/**
 * Checks if a video is already saved in the library.
 */
export function isNoteAlreadySaved(
  videoIdOrUserId: string | undefined,
  maybeVideoId?: string
): boolean {
  const videoId = maybeVideoId || videoIdOrUserId;
  if (!videoId) return false;
  const list = getLocalNotes();
  return list.some((n) => n.videoId === videoId);
}
