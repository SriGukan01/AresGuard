import { Location } from '@/types/emergency';

// Helper to resolve the nearest hospital name based on user coordinates / region
export function getNearestHospitalName(userLoc?: Location | null): string {
  const addr = (userLoc?.address || '').toLowerCase();
  const lat = userLoc?.latitude ?? 13.0827;
  const lng = userLoc?.longitude ?? 80.2707;

  if (addr.includes('chennai') || (lat > 12.8 && lat < 13.3 && lng > 80.0 && lng < 80.4)) {
    return 'Rajiv Gandhi Government General Hospital (Trauma Center)';
  }
  if (addr.includes('mumbai') || (lat > 18.8 && lat < 19.3 && lng > 72.7 && lng < 73.1)) {
    return 'KEM Hospital & Apex Trauma Care, Mumbai';
  }
  if (addr.includes('delhi') || (lat > 28.4 && lat < 28.9 && lng > 76.9 && lng < 77.4)) {
    return 'AIIMS Apex Trauma Center, New Delhi';
  }
  if (addr.includes('bangalore') || addr.includes('bengaluru') || (lat > 12.8 && lat < 13.1 && lng > 77.4 && lng < 77.8)) {
    return 'Victoria Hospital & Emergency Care, Bangalore';
  }
  if (addr.includes('hyderabad')) {
    return 'Osmania General Hospital & Trauma Care, Hyderabad';
  }
  return 'City Government General Hospital & Emergency Trauma Base';
}

