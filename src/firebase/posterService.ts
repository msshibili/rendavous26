import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import type { Poster, PosterFilterOptions, PosterStats } from '../types/poster';
import { INITIAL_DEMO_POSTERS } from './demoPosters';

const STORAGE_KEY = 'badrul_huda_posters_v1';

// Helper to get local posters from LocalStorage or initialize with seed
function getLocalPosters(): Poster[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading LocalStorage posters", e);
  }
  // Save seed data if empty
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_POSTERS));
  return INITIAL_DEMO_POSTERS;
}

function saveLocalPosters(posters: Poster[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posters));
  } catch (e) {
    console.error("Error saving LocalStorage posters", e);
  }
}

export async function getPosters(options: PosterFilterOptions = {}): Promise<Poster[]> {
  let posters: Poster[] = [];

  if (isFirebaseConfigured) {
    try {
      const postersRef = collection(db, 'posters');
      const q = query(postersRef);
      const snapshot = await getDocs(q);
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        posters.push({
          id: docSnap.id,
          ...data,
          uploadedAt: data.uploadedAt?.toDate?.() ? data.uploadedAt.toDate().toISOString() : data.uploadedAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
        } as Poster);
      });

      if (posters.length === 0) {
        posters = getLocalPosters();
      }
    } catch (err) {
      console.warn("Firestore fetch failed, using fallback posters:", err);
      posters = getLocalPosters();
    }
  } else {
    posters = getLocalPosters();
  }

  // Filter by published unless admin explicitly requests all
  if (options.isPublished !== false) {
    posters = posters.filter(p => p.isPublished);
  }

  // Filter by category
  if (options.category && options.category !== 'All') {
    posters = posters.filter(p => p.category.toLowerCase() === options.category?.toLowerCase());
  }

  // Filter by featured
  if (options.isFeatured) {
    posters = posters.filter(p => p.isFeatured);
  }

  // Filter by eventName
  if (options.eventName) {
    posters = posters.filter(p => p.eventName.toLowerCase().includes(options.eventName!.toLowerCase()));
  }

  // Search query across title, eventName, category, tags, description
  if (options.searchQuery && options.searchQuery.trim()) {
    const q = options.searchQuery.trim().toLowerCase();
    posters = posters.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.eventName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(q)))
    );
  }

  // Sort
  if (options.sortBy) {
    switch (options.sortBy) {
      case 'latest':
        posters.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        break;
      case 'oldest':
        posters.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
        break;
      case 'downloads':
        posters.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      case 'featured':
        posters.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }
  } else {
    // Default newest first
    posters.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  return posters;
}

export async function getPosterBySlug(slug: string): Promise<Poster | null> {
  const all = await getPosters({ isPublished: false });
  return all.find(p => p.slug === slug) || null;
}

export async function getPosterById(id: string): Promise<Poster | null> {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'posters', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          id: snap.id,
          ...data,
          uploadedAt: data.uploadedAt?.toDate?.() ? data.uploadedAt.toDate().toISOString() : data.uploadedAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
        } as Poster;
      }
    } catch (e) {
      console.warn("Firestore getDoc error, falling back:", e);
    }
  }

  const local = getLocalPosters();
  return local.find(p => p.id === id) || null;
}

export async function createPoster(
  data: Omit<Poster, 'id' | 'uploadedAt' | 'updatedAt' | 'downloadCount' | 'shareCount'>
): Promise<Poster> {
  const now = new Date().toISOString();
  
  const newPoster: Poster = {
    ...data,
    id: 'poster-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    uploadedAt: now,
    updatedAt: now,
    downloadCount: 0,
    shareCount: 0,
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, 'posters'), {
        ...data,
        uploadedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        downloadCount: 0,
        shareCount: 0,
      });
      newPoster.id = docRef.id;
    } catch (err) {
      console.warn("Firestore createPoster failed, saving locally:", err);
    }
  }

  const local = getLocalPosters();
  local.unshift(newPoster);
  saveLocalPosters(local);

  return newPoster;
}

export async function updatePoster(id: string, updates: Partial<Poster>): Promise<Poster> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'posters', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn("Firestore updatePoster failed, updating locally:", err);
    }
  }

  const local = getLocalPosters();
  const index = local.findIndex(p => p.id === id);
  if (index !== -1) {
    local[index] = {
      ...local[index],
      ...updates,
      updatedAt: now,
    };
    saveLocalPosters(local);
    return local[index];
  }

  throw new Error("Poster not found");
}

export async function deletePoster(id: string): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'posters', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn("Firestore deletePoster failed:", err);
    }
  }

  const local = getLocalPosters().filter(p => p.id !== id);
  saveLocalPosters(local);
}

export async function incrementDownloadCount(id: string): Promise<number> {
  let newCount = 0;
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'posters', id);
      await updateDoc(docRef, {
        downloadCount: increment(1),
      });
    } catch (e) {
      console.warn("Firestore increment download error:", e);
    }
  }

  const local = getLocalPosters();
  const index = local.findIndex(p => p.id === id);
  if (index !== -1) {
    local[index].downloadCount += 1;
    newCount = local[index].downloadCount;
    saveLocalPosters(local);
  }
  return newCount;
}

export async function incrementShareCount(id: string): Promise<number> {
  let newCount = 0;
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'posters', id);
      await updateDoc(docRef, {
        shareCount: increment(1),
      });
    } catch (e) {
      console.warn("Firestore increment share error:", e);
    }
  }

  const local = getLocalPosters();
  const index = local.findIndex(p => p.id === id);
  if (index !== -1) {
    local[index].shareCount += 1;
    newCount = local[index].shareCount;
    saveLocalPosters(local);
  }
  return newCount;
}

export async function getPosterStats(): Promise<PosterStats> {
  const all = await getPosters({ isPublished: false });
  return {
    totalPosters: all.length,
    publishedCount: all.filter(p => p.isPublished).length,
    draftCount: all.filter(p => !p.isPublished).length,
    featuredCount: all.filter(p => p.isFeatured).length,
    totalDownloads: all.reduce((sum, p) => sum + (p.downloadCount || 0), 0),
    totalShares: all.reduce((sum, p) => sum + (p.shareCount || 0), 0),
  };
}
