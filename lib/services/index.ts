import { isFirebaseConfigured } from "@/lib/firebase";
import { MockDriverPanelService } from "@/lib/mock-service";
import { FirestoreDriverPanelService } from "@/lib/services/firestore";
import type { DriverPanelService } from "@/lib/services/types";

/**
 * Pick the service implementation:
 * - the in-memory mock when `NEXT_PUBLIC_USE_MOCK=1`, or when Firebase isn't
 *   configured (so the UI still runs/builds/demos with no credentials);
 * - the Firestore-backed service otherwise.
 */
export function createService(): DriverPanelService {
  const forceMock = process.env.NEXT_PUBLIC_USE_MOCK === "1";
  if (forceMock || !isFirebaseConfigured) {
    return new MockDriverPanelService();
  }
  return new FirestoreDriverPanelService();
}

export type { DriverPanelService } from "@/lib/services/types";
