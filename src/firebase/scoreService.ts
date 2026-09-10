import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import type { TeamScore } from '../types/score';

const SCORES_COLLECTION = 'team_scores';

// Exactly 2 Teams for the festival as requested
export const DEFAULT_TEAM_SCORES: TeamScore[] = [
  {
    id: 'team-safa',
    name: 'Team Safa',
    points: 345,
    stagePoints: 195,
    offStagePoints: 150,
    color: '#10B981', // Emerald
    leadTag: '1st Place • Lead',
  },
  {
    id: 'team-marwa',
    name: 'Team Marwa',
    points: 320,
    stagePoints: 180,
    offStagePoints: 140,
    color: '#F59E0B', // Amber
    leadTag: '2nd Place',
  },
];

const LOCAL_STORAGE_KEY = 'rendezvous_team_scores_v2';

function getLocalScores(): TeamScore[] {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn("Error reading local scores cache:", e);
  }
  return DEFAULT_TEAM_SCORES;
}

function saveLocalScores(scores: TeamScore[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scores));
  } catch (e) {
    console.warn("Error caching team scores locally:", e);
  }
}

/**
 * Fetch current team scores
 */
export async function getTeamScores(): Promise<TeamScore[]> {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, SCORES_COLLECTION), orderBy('points', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const scores = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as TeamScore[];
        saveLocalScores(scores);
        return scores;
      }
    } catch (e) {
      console.warn("Firestore fetch team scores error, using fallback:", e);
    }
  }
  return getLocalScores();
}

/**
 * Real-time listener for team scores
 */
export function subscribeToTeamScores(
  onUpdate: (scores: TeamScore[]) => void
): () => void {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, SCORES_COLLECTION), orderBy('points', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const scores = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            })) as TeamScore[];
            saveLocalScores(scores);
            onUpdate(scores);
          } else {
            // Seed initial scores if collection is empty
            seedInitialTeamScores().then((seeded) => onUpdate(seeded));
          }
        },
        (error) => {
          console.warn("Realtime team scores subscription error:", error);
          onUpdate(getLocalScores());
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn("Failed to subscribe to team scores:", e);
    }
  }

  // Fallback if Firebase not configured
  onUpdate(getLocalScores());
  return () => {};
}

/**
 * Seed initial default teams into Firestore
 */
export async function seedInitialTeamScores(): Promise<TeamScore[]> {
  if (isFirebaseConfigured) {
    try {
      for (const team of DEFAULT_TEAM_SCORES) {
        await setDoc(doc(db, SCORES_COLLECTION, team.id), {
          ...team,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn("Error seeding team scores to Firestore:", e);
    }
  }
  saveLocalScores(DEFAULT_TEAM_SCORES);
  return DEFAULT_TEAM_SCORES;
}

/**
 * Save / update all team scores (Admin action)
 */
export async function updateTeamScores(scores: TeamScore[]): Promise<TeamScore[]> {
  // Sort by total points descending
  const sorted = [...scores].sort((a, b) => b.points - a.points);

  // Helper for rank labels
  const getRankTag = (rank: number) => {
    if (rank === 1) return '1st Place • Lead';
    if (rank === 2) return '2nd Place';
    if (rank === 3) return '3rd Place';
    return `${rank}th Place`;
  };

  // Update lead tags based on rank
  const updatedWithTags = sorted.map((t, idx) => ({
    ...t,
    leadTag: getRankTag(idx + 1),
    updatedAt: new Date().toISOString(),
  }));

  if (isFirebaseConfigured) {
    try {
      for (const team of updatedWithTags) {
        const ref = doc(db, SCORES_COLLECTION, team.id);
        await setDoc(ref, team, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore update team scores error:", e);
    }
  }

  saveLocalScores(updatedWithTags);
  return updatedWithTags;
}

/**
 * Delete a team score (Admin action)
 */
export async function deleteTeamScore(teamId: string): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, SCORES_COLLECTION, teamId));
    } catch (e) {
      console.warn("Firestore delete team score error:", e);
    }
  }
  const current = getLocalScores();
  const filtered = current.filter((t) => t.id !== teamId);
  saveLocalScores(filtered);
}
