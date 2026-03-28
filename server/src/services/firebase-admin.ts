import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { DecodedIdToken } from "firebase-admin/auth";
import { env } from "../config/env";

const buildPrivateKey = (value?: string) =>
  value ? value.replace(/\\n/g, "\n") : undefined;

export class FirebaseAuthService {
  private initialized = false;

  constructor() {
    if (
      env.FIREBASE_PROJECT_ID &&
      env.FIREBASE_CLIENT_EMAIL &&
      env.FIREBASE_PRIVATE_KEY &&
      getApps().length === 0
    ) {
      initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: buildPrivateKey(env.FIREBASE_PRIVATE_KEY)
        })
      });
      this.initialized = true;
    } else if (getApps().length > 0) {
      this.initialized = true;
    }
  }

  isConfigured() {
    return this.initialized;
  }

  async verifyIdToken(token: string): Promise<DecodedIdToken | null> {
    if (!this.initialized) {
      return null;
    }

    try {
      return await getAuth().verifyIdToken(token);
    } catch {
      return null;
    }
  }
}
