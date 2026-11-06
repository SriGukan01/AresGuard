import { Department, EmergencyTypeOption, Alert, DepartmentId, AIRecommendation } from '@/types/emergency';

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
    status: 'available',
    distance: 2.8,
    eta: 7,
    units: 8,
    availableUnits: 4,
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
    status: 'available',
    distance: 3.2,
    eta: 8,
    units: 6,
    availableUnits: 3,
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
  { id: 'domestic-violence', label: 'Domestic Violence', departmentIds: ['women-child', 'police'] },
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

// Incident-specific AI reasoning map
const incidentDepartmentReasons: Record<string, Partial<Record<DepartmentId, string>>> = {
  fire: {
    fire: 'AI Recommended: Primary response unit for fire suppression & structural rescue',
    ambulance: 'Medical standby for burn care & smoke inhalation treatment',
    police: 'Perimeter evacuation security & crowd management',
  },
  assault: {
    police: 'AI Recommended: Immediate tactical response & active threat neutralization',
    ambulance: 'Emergency paramedic support for physical injury trauma triage',
  },
  robbery: {
    police: 'AI Recommended: Immediate armed patrol dispatch & perimeter containment',
    ambulance: 'Standby paramedic support for victim trauma care',
  },
  medical: {
    ambulance: 'AI Recommended: Fastest advanced life-support paramedic dispatch',
  },
  accident: {
    ambulance: 'AI Recommended: Immediate trauma triage & emergency casualty transport',
    police: 'Accident scene security, perimeter control & investigation',
    traffic: 'Roadway hazard clearance & traffic redirection',
  },
  'traffic-jam': {
    traffic: 'AI Recommended: Specialized road clearance & gridlock hazard mitigation',
    police: 'Patrol assistance for traffic regulation & route diversion',
  },
  flood: {
    disaster: 'AI Recommended: Specialized flood rescue, aquatic extraction & evacuation team',
    fire: 'Emergency water pumping equipment & extraction support',
  },
  'natural-disaster': {
    disaster: 'AI Recommended: Coordinated disaster management & rapid search and rescue',
    fire: 'Heavy rescue operations & structural collapse stabilization',
    ambulance: 'Field medical station & emergency casualty transport',
  },
  'domestic-violence': {
    'women-child': 'AI Recommended: Dedicated crisis intervention & protective victim support',
    police: 'Immediate law enforcement protection & personal safety patrol',
  },
  other: {
    police: 'AI Recommended: On-site emergency assessment & situation management',
  },
};

export const getAIRecommendation = (
  selectedTypes: string[],
  departments: Department[]
): AIRecommendation[] => {
  // Determine primary department for each selected emergency type
  const primaryDeptIds = new Set<DepartmentId>();
  selectedTypes.forEach(typeId => {
    const type = emergencyTypes.find(t => t.id === typeId);
    if (type && type.departmentIds.length > 0) {
      primaryDeptIds.add(type.departmentIds[0]);
    }
  });

  return departments.map(dept => {
    const isPrimary = primaryDeptIds.has(dept.id);
    
    // Check for an incident-tailored reason
    let tailoredReason: string | undefined;
    for (const typeId of selectedTypes) {
      const reasonsForType = incidentDepartmentReasons[typeId];
      if (reasonsForType && reasonsForType[dept.id]) {
        tailoredReason = reasonsForType[dept.id];
        // If this is the primary recommendation for this type, prioritize this reason
        if (isPrimary) break;
      }
    }

    const fallbackReason = dept.status === 'available'
      ? `Fastest response - ${dept.eta} min ETA`
      : `Currently ${dept.status}, ~${dept.estimatedWaitTime || 5} min wait`;

    return {
      departmentId: dept.id,
      reason: tailoredReason || fallbackReason,
      confidence: isPrimary ? 0.98 : (tailoredReason ? 0.85 : 0.65),
      isPrimary,
      estimatedResponseTime: dept.eta || 15,
    };
  });
};
