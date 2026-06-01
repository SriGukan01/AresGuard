import { Department, EmergencyTypeOption, Alert } from '@/types/emergency';

export const departments: Department[] = [
  {
    id: 'ambulance',
    name: 'Ambulance / Medical',
    icon: '🚑',
    description: 'Medical emergencies, injuries, health crises',
    status: 'available',
    distance: 2.3,
    eta: 8,
    units: 12,
    availableUnits: 5,
  },
  {
    id: 'fire',
    name: 'Fire Department',
    icon: '🚒',
    description: 'Fire emergencies, rescue operations, hazmat',
    status: 'busy',
    estimatedWaitTime: 5,
    distance: 3.1,
    eta: 12,
    units: 8,
    availableUnits: 2,
  },
  {
    id: 'police',
    name: 'Police',
    icon: '🚔',
    description: 'Crime, security threats, law enforcement',
    status: 'available',
    distance: 1.8,
    eta: 6,
    units: 20,
    availableUnits: 8,
  },
  {
    id: 'disaster',
    name: 'Disaster Response',
    icon: '🛡️',
    description: 'Natural disasters, large-scale emergencies',
    status: 'available',
    distance: 5.2,
    eta: 15,
    units: 6,
    availableUnits: 4,
  },
  {
    id: 'women-child',
    name: 'Women & Child Safety',
    icon: '👨‍👩‍👧',
    description: 'Domestic violence, child safety, harassment',
    status: 'occupied',
    estimatedWaitTime: 15,
    nextAvailable: '10 min',
    distance: 4.0,
    eta: 20,
    units: 4,
    availableUnits: 0,
  },
  {
    id: 'traffic',
    name: 'Road & Traffic Emergency',
    icon: '🚧',
    description: 'Traffic accidents, road hazards, vehicle emergencies',
    status: 'busy',
    estimatedWaitTime: 3,
    distance: 2.0,
    eta: 7,
    units: 10,
    availableUnits: 3,
  },
];

export const emergencyTypes: EmergencyTypeOption[] = [
  { id: 'accident', label: 'Accident', departmentIds: ['ambulance', 'police', 'traffic'] },
  { id: 'fire', label: 'Fire', departmentIds: ['fire', 'ambulance'] },
  { id: 'flood', label: 'Flood', departmentIds: ['disaster', 'fire'] },
  { id: 'assault', label: 'Assault', departmentIds: ['police', 'ambulance'] },
  { id: 'medical', label: 'Medical Emergency', departmentIds: ['ambulance'] },
  { id: 'robbery', label: 'Robbery / Theft', departmentIds: ['police'] },
  { id: 'natural-disaster', label: 'Natural Disaster', departmentIds: ['disaster', 'fire', 'ambulance'] },
  { id: 'domestic-violence', label: 'Domestic Violence', departmentIds: ['police', 'women-child'] },
  { id: 'traffic-jam', label: 'Traffic Emergency', departmentIds: ['traffic', 'police'] },
  { id: 'other', label: 'Other', departmentIds: ['police'] },
];

export const sampleAlerts: Alert[] = [
  {
    id: '1',
    type: 'disaster',
    title: 'Flash Flood Warning',
    message: 'Heavy rainfall expected in your area. Avoid low-lying zones.',
    location: 'Downtown District',
    priority: 'high',
    timestamp: new Date(),
    dismissible: true,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Traffic Advisory',
    message: 'Major accident on Highway 101. Expect delays of 30+ minutes.',
    location: 'Highway 101 North',
    priority: 'medium',
    timestamp: new Date(Date.now() - 15 * 60000),
    dismissible: true,
  },
  {
    id: '3',
    type: 'safety',
    title: 'Safety Alert',
    message: 'Increased patrol in your neighborhood due to recent incidents.',
    priority: 'low',
    timestamp: new Date(Date.now() - 60 * 60000),
    dismissible: true,
  },
];

export const getAIRecommendation = (
  selectedTypes: string[],
  departments: Department[]
) => {
  const availableDepts = departments.filter(d => d.status === 'available');
  const busyDepts = departments.filter(d => d.status === 'busy');
  
  // Sort by ETA and availability
  const sorted = [...departments].sort((a, b) => {
    if (a.status === 'available' && b.status !== 'available') return -1;
    if (b.status === 'available' && a.status !== 'available') return 1;
    return (a.eta || 999) - (b.eta || 999);
  });

  return sorted.map(dept => ({
    departmentId: dept.id,
    reason: dept.status === 'available' 
      ? `Fastest response - ${dept.eta} min ETA`
      : `Currently ${dept.status}, ~${dept.estimatedWaitTime || 5} min wait`,
    confidence: dept.status === 'available' ? 0.95 : 0.7,
    estimatedResponseTime: dept.eta || 15,
  }));
};
