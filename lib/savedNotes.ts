import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import type { SavedNote, AnalyzeResponse } from "@/types";

const LOCAL_STORAGE_KEY_PREFIX = "edurova_saved_notes_";

function getLocalNotes(userId: string = "guest"): SavedNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalNotes(userId: string = "guest", notes: SavedNote[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${LOCAL_STORAGE_KEY_PREFIX}${userId}`,
      JSON.stringify(notes)
    );
  } catch (err) {
    console.warn("Failed to write to localStorage:", err);
  }
}

/**
 * Saves a video analysis to the user's library (Firestore + LocalStorage backup).
 */
export async function saveNoteToLibrary(
  userId: string | undefined,
  data: AnalyzeResponse
): Promise<SavedNote> {
  const note: SavedNote = {
    id: data.videoInfo.id,
    videoId: data.videoInfo.id,
    videoInfo: data.videoInfo,
    analysis: data.analysis,
    transcript: data.transcript,
    rawTranscript: data.rawTranscript,
    savedAt: Date.now(),
  };

  const effectiveUserId = userId || "guest";

  // 1. Save locally first (instant)
  const current = getLocalNotes(effectiveUserId);
  const filtered = current.filter((n) => n.videoId !== note.videoId);
  const updated = [note, ...filtered];
  setLocalNotes(effectiveUserId, updated);

  // 2. If authenticated and Firestore is available, save to cloud
  if (userId && db) {
    try {
      const noteRef = doc(db, "users", userId, "saved_notes", note.videoId);
      await setDoc(noteRef, note);
    } catch (err) {
      console.warn("[SavedNotes] Firestore save warning (using local backup):", err);
    }
  }

  return note;
}

/**
 * Retrieves all saved notes for a user (Cloud Firestore + LocalStorage fallback).
 */
export async function getSavedNotesFromLibrary(
  userId: string | undefined
): Promise<SavedNote[]> {
  const effectiveUserId = userId || "guest";
  const localList = getLocalNotes(effectiveUserId);

  if (!userId || !db) {
    return localList;
  }

  try {
    const notesRef = collection(db, "users", userId, "saved_notes");
    const q = query(notesRef, orderBy("savedAt", "desc"));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const cloudList: SavedNote[] = [];
      snapshot.forEach((d) => {
        cloudList.push(d.data() as SavedNote);
      });
      // Sync cloud down to local storage
      setLocalNotes(userId, cloudList);
      return cloudList;
    }
  } catch (err) {
    console.warn("[SavedNotes] Firestore fetch warning (falling back to local):", err);
  }

  return localList;
}

/**
 * Removes a note from the library.
 */
export async function deleteNoteFromLibrary(
  userId: string | undefined,
  videoId: string
): Promise<void> {
  const effectiveUserId = userId || "guest";

  // 1. Remove from local storage
  const current = getLocalNotes(effectiveUserId);
  const updated = current.filter((n) => n.videoId !== videoId);
  setLocalNotes(effectiveUserId, updated);

  // 2. Remove from Firestore if online & logged in
  if (userId && db) {
    try {
      const noteRef = doc(db, "users", userId, "saved_notes", videoId);
      await deleteDoc(noteRef);
    } catch (err) {
      console.warn("[SavedNotes] Firestore delete warning:", err);
    }
  }
}

/**
 * Checks if a video is already saved in the user's library.
 */
export function isNoteAlreadySaved(
  userId: string | undefined,
  videoId: string
): boolean {
  const effectiveUserId = userId || "guest";
  const list = getLocalNotes(effectiveUserId);
  return list.some((n) => n.videoId === videoId);
}
