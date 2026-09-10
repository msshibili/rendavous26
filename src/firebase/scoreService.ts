import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import type { TeamScore } from '../types/score';

const SCORES_COLLECTION = 'team_scores';

// Default initial demo teams if no scores exist in DB
export const DEFAULT_TEAM_SCORES: TeamScore[] = [
  {
    id: 'team-safa',
    name: 'Team Safa',
    points: 345,
    stagePoints: 195,
    offStagePoints: 150,
    color: '#10B981', // Emerald
    leadTag: 'Overall Leader',
  },
  {
    id: 'team-marwa',
    name: 'Team Marwa',
    points: 310,
    stagePoints: 170,
    offStagePoints: 140,
    color: '#F59E0B', // Amber
    leadTag: '2nd Place',
  },
  {
    id: 'team-quds',
    name: 'Team Quds',
    points: 285,
    stagePoints: 155,
    offStagePoints: 130,
    color: '#3B82F6', // Blue
    leadTag: '3rd Place',
  },
  {
    id: 'team-uhud',
    name: 'Team Uhud',
    points: 260,
    stagePoints: 140,
    offStagePoints: 120,
    color: '#8B5CF6', // Purple
    leadTag: '4th Place',
  },
];

const LOCAL_STORAGE_KEY = 'rendezvous_team_scores_v1';

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

  // Update lead tags based on rank
  const updatedWithTags = sorted.map((t, idx) => ({
    ...t,
    leadTag: idx === 0 ? 'Overall Leader' : `#${idx + 1} Position`,
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
