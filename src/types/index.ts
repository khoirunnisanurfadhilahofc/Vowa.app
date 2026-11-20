export type ServiceProvider = 'Gojek' | 'Grab' | 'Maxim' | 'inDrive' | 'Taksi / Lainnya';
export type VehicleType = 'Mobil (Car)' | 'Motor (Bike)';

export interface IncidentReport {
  id: string;
  createdAt: string;
  incidentDate: string;
  incidentTime: string;
  serviceProvider: ServiceProvider;
  vehicleType: VehicleType;
  licensePlate: string;
  driverName: string;
  pickupLocation: string;
  destinationLocation: string;
  incidentCategories: string[];
  description: string;
  chronologySummary?: string;
  evidenceItems: {
    id: string;
    name: string;
    type: 'image' | 'audio' | 'document';
    url?: string;
  }[];
  isAnonymous: boolean;
  status: 'Tersimpan Aman' | 'Sudah Dilaporkan ke Aplikator' | 'Diteruskan ke Lembaga';
  reporterName?: string;
  reporterContact?: string;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface DirectoryItem {
  id: string;
  name: string;
  category: 'Resmi Pemerintah' | 'Bantuan Hukum (LBH)' | 'Konseling Psikologis' | 'Hotline Aplikator' | 'Polisi & Medis';
  phone: string;
  whatsapp?: string;
  serviceHours: string;
  area: string;
  description: string;
  website?: string;
  badgeText: string;
}

export interface CommunityStory {
  id: string;
  authorNickname: string;
  city: string;
  timeAgo: string;
  serviceProvider: ServiceProvider;
  category: 'Waspada Modus' | 'Kisah Solidaritas' | 'Tips Bertindak' | 'Pemulihan Diri';
  title: string;
  story: string;
  takeaway: string;
  supportHugs: number;
}

export interface TripSession {
  id: string;
  createdAt: string;
  startTime: string;
  serviceProvider: ServiceProvider;
  vehicleType: VehicleType;
  licensePlate: string;
  driverName: string;
  pickupLocation: string;
  destinationLocation: string;
  estimatedDurationMinutes: number;
  status: 'active' | 'completed' | 'sos_triggered';
  checkInIntervalMinutes: number;
  progressPercent: number;
  currentSpeedKmh: number;
  isDeviated: boolean;
  deviationMessage?: string;
  lastCheckInAt?: string;
  hasUnansweredCheckIn?: boolean;
  coords: {
    lat: number;
    lng: number;
  };
  destinationCoords: {
    lat: number;
    lng: number;
  };
  guardianShareCode?: string;
  batteryLevel?: number;
  isAuthorityNotified?: boolean;
  offlineBreadcrumbsCount?: number;
}

export interface DriverRegistryItem {
  plateNumber: string;
  driverName: string;
  serviceProvider: ServiceProvider;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehicleColor: string;
  safetyScore: number; // e.g. 98%
  safetyStatus: 'Terverifikasi Aman' | 'Waspada / Catatan Keamanan' | 'Dalam Peninjauan';
  certificationNote: string;
  reportedIncidentsCount: number;
  registeredCity: string;
  lastUpdated: string;
}

export interface OfflineEmergencyPayload {
  coords: { lat: number; lng: number };
  timestamp: string;
  plateNumber: string;
  driverName: string;
  serviceProvider: ServiceProvider;
  recipientPhone: string;
  smsBody: string;
}

