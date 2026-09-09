import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export function subscribeToAuthChanges(callback: (user: AdminUser | null) => void) {
  if (isFirebaseConfigured) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Festival Admin'
        });
      } else {
        // Check local storage session fallback
        const local = localStorage.getItem('badrul_admin_session');
        callback(local ? JSON.parse(local) : null);
      }
    });
  } else {
    // Local storage session fallback
    const local = localStorage.getItem('badrul_admin_session');
    callback(local ? JSON.parse(local) : null);
    return () => {};
  }
}

export async function loginAdmin(email: string, pass: string): Promise<AdminUser> {
  if (isFirebaseConfigured) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      const adminUser: AdminUser = {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName || 'Festival Admin'
      };
      localStorage.setItem('badrul_admin_session', JSON.stringify(adminUser));
      return adminUser;
    } catch (err: any) {
      console.error("Firebase auth login error:", err);
      throw new Error(err.message || 'Invalid admin credentials');
    }
  }

  // Demo fallback admin login verification
  if (email.trim() && pass.length >= 6) {
    const adminUser: AdminUser = {
      uid: 'admin-local-1',
      email: email,
      displayName: 'Badrul Huda Admin'
    };
    localStorage.setItem('badrul_admin_session', JSON.stringify(adminUser));
    return adminUser;
  }

  throw new Error("Invalid email or password (password must be at least 6 characters)");
}

export async function logoutAdmin(): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Firebase signout error:", e);
    }
  }
  localStorage.removeItem('badrul_admin_session');
}
