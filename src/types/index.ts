export type EmploymentStatus = 
  | 'занят' 
  | 'предприниматель' 
  | 'обучается' 
  | 'направлен на обучение' 
  | 'безработный' 
  | 'не уточнено';

export type EducationLevel = string;

export type VerificationState = 'pending_verification' | 'verified' | 'rejected';

export type Gender = 'Мужской' | 'Женский';

export interface StatusHistoryItem {
  date: string;
  status: EmploymentStatus;
  comment?: string;
  officer?: string;
}

export interface SupportProgram {
  id: string;
  title: string;
  provider: string;
  category: 'обучение' | 'it_стажировка' | 'субсидия' | 'предпринимательство' | 'трудоустройство';
  duration: string;
  stipend: string;
  description: string;
  quotaLeft?: number;
  iconName: string;
}

export interface YouthProfile {
  id: string;
  full_name_demo: string;
  makhalla: string;
  age: number;
  gender: Gender;
  phone_demo: string;
  employment_status: EmploymentStatus;
  activity_type: string;
  education: EducationLevel;
  specialty?: string;
  skills: string[];
  is_neet: boolean;
  neet_verification: VerificationState;
  neet_verified_by?: string;
  neet_verified_at?: string;
  needs_support: boolean;
  support_recommendation: string[];
  assigned_program?: SupportProgram;
  assigned_at?: string;
  assigned_officer?: string;
  last_updated: string;
  notes?: string;
  status_history: StatusHistoryItem[];
}

export type UserRole = 'district_officer' | 'mahalla_leader' | 'employment_center';

export interface MakhallaStats {
  id: string;
  name: string;
  totalYouth: number;
  employed: number;
  studying: number;
  unemployed: number;
  neetCount: number;
  neetPending: number;
  supportedCount: number;
  employmentRate: number;
  leaderName: string;
  leaderPhone: string;
  riskLevel: 'low' | 'medium' | 'high';
  coordinates: { x: number; y: number };
  geoCenter: [number, number];
  geoPolygon: [number, number][];
}

export interface InfrastructurePOI {
  id: string;
  name: string;
  nameUz: string;
  category: 'monocenter' | 'it_park' | 'employment_center' | 'youth_center' | 'university';
  address: string;
  phone: string;
  coordinates: [number, number];
  servicesCount: number;
  descriptionRu: string;
  descriptionUz: string;
}
