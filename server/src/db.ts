import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { YouthProfile, SupportProgram, EmploymentStatus, VerificationState, LiveEvent } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_PATH = path.join(DATA_DIR, 'store.json');

export interface DBStore {
  youth: YouthProfile[];
  events: LiveEvent[];
}

const INITIAL_MAKHALAS = [
  'Буюк Ипак Йўли', 'Олий Ҳиммат', 'Шаҳриобод', 'Авайхон',
  'Дархон', 'Феруза', 'Қорасув', 'Ҳумо'
];

function generateInitialData(): YouthProfile[] {
  const FIRST_NAMES_MALE = ['Жавохир', 'Бехзод', 'Сардор', 'Бобур', 'Темур', 'Отабек', 'Дониёр', 'Рустам', 'Санжар', 'Алишер'];
  const FIRST_NAMES_FEMALE = ['Шахноза', 'Малика', 'Дилдора', 'Нигина', 'Лола', 'Севара', 'Гулираъно', 'Зулфия', 'Шахзода'];
  const LAST_NAMES = ['Азизов', 'Каримов', 'Турсунов', 'Умаров', 'Рахимов', 'Юсупов', 'Назаров', 'Хасанов', 'Эргашев', 'Содиков'];
  
  const list: YouthProfile[] = [];
  for (let i = 1; i <= 60; i++) {
    const isFemale = i % 3 === 0;
    const firstList = isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE;
    const firstName = firstList[i % firstList.length];
    const lastNameBase = LAST_NAMES[i % LAST_NAMES.length];
    const lastName = isFemale ? `${lastNameBase}а` : lastNameBase;
    const makhalla = INITIAL_MAKHALAS[i % INITIAL_MAKHALAS.length];
    const age = 18 + (i % 13);
    const isNeet = i % 4 === 0 || i % 7 === 0;
    const neetState: VerificationState = isNeet ? (i % 2 === 0 ? 'pending_verification' : 'verified') : 'verified';
    
    let status: EmploymentStatus = 'занят';
    let activity = 'Работа по найму';
    if (isNeet) {
      status = 'безработный';
      activity = 'нет деятельности (кандидат NEET)';
    } else if (age <= 21) {
      status = 'обучается';
      activity = 'Студент вуза / колледжа';
    } else if (i % 5 === 0) {
      status = 'предприниматель';
      activity = 'Самозанятость / Торговля';
    }

    list.push({
      id: `y_${i < 10 ? '00' + i : '0' + i}`,
      full_name_demo: `${lastName} ${firstName}`,
      makhalla,
      age,
      gender: isFemale ? 'Женский' : 'Мужской',
      phone_demo: `+998 (90) ${100 + i * 7}-${10 + (i % 90)}-${20 + (i % 80)}`,
      employment_status: status,
      activity_type: activity,
      education: age > 22 ? 'Высшее' : 'Средне-специальное',
      specialty: isFemale ? 'Бухгалтерский учёт' : 'Информационные технологии',
      skills: isFemale ? ['1С', 'Excel', 'Текстиль'] : ['Автоэлектрика', 'Python', 'Сервис'],
      is_neet: isNeet,
      neet_verification: neetState,
      needs_support: isNeet,
      support_recommendation: isNeet ? ['Моноцентр «Ишга Мархамат»', 'IT-Park Ташкент'] : [],
      last_updated: new Date().toISOString().split('T')[0],
      notes: isNeet ? 'Требуется опрос по программе Ёшлар дафтари' : 'Трудоустроен',
      status_history: [
        {
          date: '2026-01-15',
          status: status,
          comment: isNeet ? 'Выявлен алгоритмическим скорингом в группу NEET' : 'Первичный учёт'
        }
      ]
    });
  }
  return list;
}

class Database {
  private store: DBStore = { youth: [], events: [] };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.store = JSON.parse(raw);
      } else {
        this.store = {
          youth: generateInitialData(),
          events: [
            {
              id: 'ev_0',
              type: 'MAHALLA_SYNC',
              timestamp: new Date().toISOString(),
              mahalla: 'Мирзо-Улугбекский район',
              author: 'Система',
              messageRu: 'База данных инициализирована и подключена к Telegram-боту.',
              messageUz: 'Ma\'lumotlar bazasi ishga tushirildi va Telegram botga ulandi.'
            }
          ]
        };
        this.save();
      }
    } catch (err) {
      console.error('Error loading DB:', err);
      this.store = { youth: generateInitialData(), events: [] };
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB:', err);
    }
  }

  public getAllYouth(): YouthProfile[] {
    return this.store.youth;
  }

  public getYouthById(id: string): YouthProfile | undefined {
    return this.store.youth.find(y => y.id === id || y.full_name_demo.toLowerCase().includes(id.toLowerCase()));
  }

  public getYouthByMahalla(mahalla: string): YouthProfile[] {
    return this.store.youth.filter(y => y.makhalla.toLowerCase() === mahalla.toLowerCase());
  }

  public getTriageQueue(mahalla?: string): YouthProfile[] {
    return this.store.youth.filter(y => {
      const matchNeet = y.is_neet || y.neet_verification === 'pending_verification' || y.employment_status === 'безработный';
      if (!mahalla) return matchNeet;
      return matchNeet && y.makhalla.toLowerCase() === mahalla.toLowerCase();
    });
  }

  public updateYouthStatus(id: string, newStatus: EmploymentStatus, officer: string, comment?: string): YouthProfile | null {
    const youth = this.store.youth.find(y => y.id === id);
    if (!youth) return null;

    const oldStatus = youth.employment_status;
    youth.employment_status = newStatus;
    if (newStatus === 'занят' || newStatus === 'предприниматель' || newStatus === 'обучается') {
      youth.is_neet = false;
      youth.neet_verification = 'verified';
    }
    youth.last_updated = new Date().toISOString().split('T')[0];
    youth.status_history.unshift({
      date: youth.last_updated,
      status: newStatus,
      comment: comment || `Статус изменен с "${oldStatus}" на "${newStatus}"`,
      officer
    });

    this.save();
    return youth;
  }

  public verifyNeetTriage(
    id: string, 
    verification: VerificationState, 
    officer: string, 
    newStatus?: EmploymentStatus, 
    comment?: string
  ): YouthProfile | null {
    const youth = this.store.youth.find(y => y.id === id);
    if (!youth) return null;

    youth.neet_verification = verification;
    youth.neet_verified_by = officer;
    youth.neet_verified_at = new Date().toISOString();
    youth.last_updated = youth.neet_verified_at.split('T')[0];

    if (newStatus) {
      youth.employment_status = newStatus;
      if (newStatus !== 'безработный') {
        youth.is_neet = false;
      }
    }

    youth.status_history.unshift({
      date: youth.last_updated,
      status: youth.employment_status,
      comment: comment || `Верификация NEET: ${verification}. Проверил: ${officer}`,
      officer
    });

    this.save();
    return youth;
  }

  public assignProgram(id: string, program: SupportProgram, officer: string): YouthProfile | null {
    const youth = this.store.youth.find(y => y.id === id);
    if (!youth) return null;

    youth.assigned_program = program;
    youth.assigned_officer = officer;
    youth.assigned_at = new Date().toISOString();
    youth.employment_status = 'направлен на обучение';
    youth.is_neet = false;
    youth.neet_verification = 'verified';
    youth.last_updated = youth.assigned_at.split('T')[0];

    youth.status_history.unshift({
      date: youth.last_updated,
      status: 'направлен на обучение',
      comment: `Направлен в программу: "${program.title}" (${program.provider})`,
      officer
    });

    this.save();
    return youth;
  }

  public createYouth(data: Partial<YouthProfile>): YouthProfile {
    const count = this.store.youth.length + 1;
    const newId = `y_${count < 10 ? '00' + count : '0' + count}`;
    const today = new Date().toISOString().split('T')[0];

    const youth: YouthProfile = {
      id: newId,
      full_name_demo: data.full_name_demo || 'Новый Гражданин',
      makhalla: data.makhalla || INITIAL_MAKHALAS[0],
      age: data.age || 20,
      gender: data.gender || 'Мужской',
      phone_demo: data.phone_demo || '+998 (90) 000-00-00',
      employment_status: data.employment_status || 'безработный',
      activity_type: data.activity_type || 'Зарегистрирован через Telegram-бот',
      education: data.education || 'Среднее',
      specialty: data.specialty || 'Не указано',
      skills: data.skills || [],
      is_neet: data.is_neet !== undefined ? data.is_neet : true,
      neet_verification: data.neet_verification || 'pending_verification',
      needs_support: data.needs_support !== undefined ? data.needs_support : true,
      support_recommendation: data.support_recommendation || ['Моноцентр «Ишга Мархамат»'],
      last_updated: today,
      notes: data.notes || 'Создано лидером махалли в Telegram-боте',
      status_history: [
        {
          date: today,
          status: data.employment_status || 'безработный',
          comment: 'Первичная регистрация через Telegram',
          officer: data.neet_verified_by || 'Ёшлар етакчиси'
        }
      ]
    };

    this.store.youth.unshift(youth);
    this.save();
    return youth;
  }

  public getEvents(limit = 20): LiveEvent[] {
    return this.store.events.slice(0, limit);
  }

  public addEvent(event: Omit<LiveEvent, 'id' | 'timestamp'>): LiveEvent {
    const newEvent: LiveEvent = {
      id: `ev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...event
    };
    this.store.events.unshift(newEvent);
    if (this.store.events.length > 100) {
      this.store.events = this.store.events.slice(0, 100);
    }
    this.save();
    return newEvent;
  }

  public getStats() {
    const all = this.store.youth;
    const total = all.length;
    const employed = all.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель').length;
    const studying = all.filter(y => y.employment_status === 'обучается').length;
    const unemployed = all.filter(y => y.employment_status === 'безработный').length;
    const neet = all.filter(y => y.is_neet).length;
    const neetPending = all.filter(y => y.neet_verification === 'pending_verification').length;
    const supported = all.filter(y => !!y.assigned_program).length;

    return {
      total,
      employed,
      studying,
      unemployed,
      neet,
      neetPending,
      supported,
      employmentRate: total ? Math.round(((employed + studying) / total) * 1000) / 10 : 0
    };
  }
}

export const db = new Database();
