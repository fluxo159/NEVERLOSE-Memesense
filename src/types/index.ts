export type EmploymentStatus = 
  | 'занят' 
  | 'безработный' 
  | 'обучается' 
  | 'предприниматель' 
  | 'не уточнено' 
  | 'направлен на обучение';

export type VerificationState = 'verified' | 'pending_verification' | 'rejected';

export type Gender = 'Мужской' | 'Женский';

export type EducationLevel = 'Среднее' | 'Средне-специальное' | 'Неоконченное высшее' | 'Высшее' | 'Магистратура';

export interface StatusHistoryItem {
  date: string;
  status: EmploymentStatus;
  comment?: string;
  officer?: string;
}

export interface SupportProgram {
  id: string;
  title: string;
  titleUz?: string;
  category: 'обучение' | 'трудоустройство' | 'предпринимательство' | 'субсидия' | 'it_стажировка';
  description: string;
  descriptionUz?: string;
  provider: string; // e.g. "Моноцентр «Ишга Мархамат»", "IT-Park", "Фонд «Ёшлар Дафтари»", "Районный Центр занятости"
  providerUz?: string;
  duration?: string;
  durationUz?: string;
  stipend?: string;
  stipendUz?: string;
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
  neet_verification: VerificationState; // 'pending_verification' | 'verified' | 'rejected'
  neet_verified_by?: string;
  neet_verified_at?: string;
  needs_support: boolean;
  support_recommendation: string[]; // IDs or names of recommended measures
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
  nameUz?: string;
  totalYouth: number;
  employed: number;
  studying: number;
  unemployed: number;
  neetCount: number;
  neetPending: number;
  supportedCount: number;
  employmentRate: number; // percentage
  leaderName: string;
  leaderPhone: string;
  leaderTelegram?: string;
  committeeAddress?: string;
  riskLevel: 'low' | 'medium' | 'high';
  coordinates: { x: number; y: number }; // For SVG map
  geoCenter: [number, number]; // [lat, lng] for Leaflet GIS
  geoPolygon: [number, number][]; // Polygon vertices [lat, lng][]
}

export interface InfrastructurePOI {
  id: string;
  name: string;
  nameUz: string;
  category: 'monocenter' | 'it_park' | 'employment_center' | 'youth_center' | 'university' | 'employer';
  address: string;
  phone: string;
  website?: string;
  workHours?: string;
  coordinates: [number, number]; // [lat, lng]
  servicesCount: number;
  descriptionRu: string;
  descriptionUz: string;
}


