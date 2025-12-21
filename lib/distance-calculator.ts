// Haversine formula to calculate distance between two points on Earth
export function calculateDistance(
  userLat: number,
  userLng: number,
  collegeLat: number,
  collegeLng: number,
) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const earthRadius = 6371000; // Earth's radius in meters
  const dLat = toRadians(collegeLat - userLat);
  const dLng = toRadians(collegeLng - userLng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(userLat)) *
      Math.cos(toRadians(collegeLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceInMeters = earthRadius * c;

  // Allow a larger range and add development bypass
  const maxDistance = 700; // Increased from 550m to 700m
  const isWithinRange = distanceInMeters <= maxDistance || process.env.NODE_ENV !== 'production';

  console.log("User Latitude:", userLat);
  console.log("User Longitude:", userLng);
  console.log("College Latitude:", collegeLat);
  console.log("College Longitude:", collegeLng);
  console.log("Calculated Distance (meters):", distanceInMeters);
  console.log("Is Within Range:", isWithinRange);

  return { distanceInMeters, isWithinRange };
}
