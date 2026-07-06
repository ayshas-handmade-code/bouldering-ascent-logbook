/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LocationType = 'gym' | 'outdoor';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  isFavorite: boolean;
  city?: string;
  wallLocations?: string[];
}

export interface RouteLog {
  id: string;
  grade: string;         // e.g., "V3" or "6A" (Required)
  color: string;         // e.g., "Red", "Blue" (Required)
  wallLocation: string;  // e.g., "Main Arch", "East Wall" (Required)
  holdsType: string[];   // e.g., ["Crimps", "Slopers", "Jugs", "Pockets", "Pinches", "Volumes"]
  routeType: string[];   // e.g., ["Overhang", "Slab", "Vertical", "Roof", "Arete", "Chimney"]
  attempts: number;      // Total attempts (including sends)
  sends: number;         // Clean ascents
  flashes: number;       // Completed on very first try
  photoId?: string;      // Key for photo stored in IndexedDB (optional)
  isFavorite: boolean;   // Route favorite option
  handPlacements: string[];
  footPlacements: string[];
}

export interface ClimbingSession {
  id: string;
  date: string;          // YYYY-MM-DD
  locationId: string;
  locationName: string;
  locationType: LocationType;
  notes?: string;
  routes: RouteLog[];
}

export interface ClimbingStats {
  totalSessions: number;
  totalAttempts: number;
  totalSends: number;
  totalFlashes: number;
  maxGrade: string;
  flashRate: number;     // flashes / total routes logged
  successRate: number;   // sends / total attempts
}

export interface UserSettings {

}
