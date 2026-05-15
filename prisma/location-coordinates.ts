/** Known city/region coordinates keyed by normalized location substring. */
export const LOCATION_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  maldives: { latitude: 3.2028, longitude: 73.2207 },
  nepal: { latitude: 27.7172, longitude: 85.324 },
  "new york": { latitude: 40.7128, longitude: -74.006 },
  paris: { latitude: 48.8566, longitude: 2.3522 },
  france: { latitude: 46.2276, longitude: 2.2137 },
  nantes: { latitude: 47.2184, longitude: -1.5536 },
  london: { latitude: 51.5074, longitude: -0.1278 },
  tokyo: { latitude: 35.6762, longitude: 139.6503 },
  miami: { latitude: 25.7617, longitude: -80.1918 },
  barcelona: { latitude: 41.3874, longitude: 2.1686 },
  rome: { latitude: 41.9028, longitude: 12.4964 },
  sydney: { latitude: -33.8688, longitude: 151.2093 },
  kigali: { latitude: -1.9500, longitude: 30.0589 },
};

export function coordinatesForLocation(location: string): { latitude: number; longitude: number } | null {
  const normalized = location.trim().toLowerCase();

  if (LOCATION_COORDINATES[normalized]) {
    return LOCATION_COORDINATES[normalized];
  }

  for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }

  return null;
}
