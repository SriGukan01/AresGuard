export type DepartmentId = 
  | 'ambulance' 
  | 'fire' 
  | 'police' 
  | 'disaster' 
  | 'women-child' 
  | 'traffic';

export type AvailabilityStatus = 'available' | 'busy' | 'occupied';

export type EmergencyType = 
  | 'accident' 
  | 'fire' 
  | 'flood' 
  | 'assault' 
  | 'medical' 
  | 'robbery'
  | 'natural-disaster'
  | 'domestic-violence'
  | 'traffic-jam'
  | 'other';

export interface Department {
  id: DepartmentId;
  name: string;
  icon: string;
  description: string;
  status: AvailabilityStatus;
  estimatedWaitTime?: number; // in minutes
  nextAvailable?: string;
  distance?: number; // in km
  eta?: number; // in minutes
  units: number;
  availableUnits: number;
}

export interface EmergencyTypeOption {
  id: EmergencyType;
  label: string;
  departmentIds: DepartmentId[];
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

export interface Alert {
  id: string;
  type: 'disaster' | 'warning' | 'safety' | 'info';
  title: string;
  message: string;
  location?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  dismissible: boolean;
}

export interface EmergencyReport {
  id: string;
  location: Location;
  emergencyTypes: EmergencyType[];
  selectedDepartments: DepartmentId[];
  timestamp: Date;
  status: 'pending' | 'dispatched' | 'in-progress' | 'resolved';
  assignedUnits?: AssignedUnit[];
}

export interface AssignedUnit {
  id: string;
  departmentId: DepartmentId;
  unitName: string;
  eta: number;
  distance: number;
  status: 'dispatched' | 'en-route' | 'arrived';
  currentLocation?: Location;
}

export interface AIRecommendation {
  departmentId: DepartmentId;
  reason: string;
  confidence: number;
  alternativeDepartmentId?: DepartmentId;
  estimatedResponseTime: number;
}
