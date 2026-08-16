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
  provider: string;
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

export interface LiveEvent {
  id: string;
  type: 'TRIAGE_VERIFIED' | 'STATUS_CHANGED' | 'NEW_YOUTH' | 'PROGRAM_ASSIGNED' | 'MAHALLA_SYNC';
  timestamp: string;
  mahalla: string;
  author: string;
  messageRu: string;
  messageUz: string;
  youth?: YouthProfile;
}
