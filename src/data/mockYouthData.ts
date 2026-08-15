import { YouthProfile, EmploymentStatus, Gender, EducationLevel } from '../types';

const FIRST_NAMES_MALE = [
  'Жавохир', 'Бехзод', 'Сардор', 'Бобур', 'Темур', 'Отабек', 'Дониёр', 'Рустам',
  'Санжар', 'Алишер', 'Исломбек', 'Бекзод', 'Жахонгир', 'Достон', 'Аброр', 'Мирзохид',
  'Озодбек', 'Азизбек', 'Фаррух', 'Шерзод', 'Нодир', 'Улугбек', 'Камол', 'Шухрат',
  'Хусан', 'Хасан', 'Элдор', 'Дилшод', 'Илхом', 'Зафар', 'Шавкат', 'Акмал', 'Жасур'
];

const FIRST_NAMES_FEMALE = [
  'Шахноза', 'Малика', 'Дилдора', 'Нигина', 'Лола', 'Севара', 'Гулираъно', 'Зулфия',
  'Шахзода', 'Нодира', 'Камола', 'Диёра', 'Гулноза', 'Райхона', 'Мадина', 'Нилуфар',
  'Зарина', 'Дурдона', 'Мохинур', 'Сайёра', 'Муниса', 'Феруза', 'Юлдуз', 'Хуснора'
];

const LAST_NAMES_MALE = [
  'Азизов', 'Каримов', 'Турсунов', 'Умаров', 'Рахимов', 'Юсупов', 'Назаров', 'Хасанов',
  'Эргашев', 'Содиков', 'Абдуллаев', 'Мирзаев', 'Салимов', 'Джураев', 'Ганиев', 'Ходжаев',
  'Норматов', 'Кудратов', 'Расулов', 'Ботиров', 'Иноятов', 'Темиров', 'Юсуфов', 'Абдурахимов',
  'Камолов', 'Файзиев', 'Муминов', 'Саидов', 'Алимов', 'Махмудов', 'Исмаилов', 'Ахмедов'
];

const LAST_NAMES_FEMALE = [
  'Азизова', 'Каримова', 'Турсунова', 'Умарова', 'Рахимова', 'Юсупова', 'Назарова', 'Хасанова',
  'Эргашева', 'Содикова', 'Абдуллаева', 'Мирзаева', 'Салимова', 'Джураева', 'Ганиева', 'Ходжаева',
  'Норматова', 'Кудратова', 'Расулова', 'Ботирова', 'Иноятова', 'Темирова', 'Юсуфова', 'Абдурахимова',
  'Камолова', 'Файзиева', 'Муминова', 'Саидова', 'Алимова', 'Махмудова', 'Исмаилова', 'Ахмедова'
];

const PATRONYMICS_MALE = [
  'Камолович', 'Алишерович', 'Олимович', 'Муродович', 'Закирович', 'Равшанович', 'Мансурович',
  'Баходирович', 'Кахрамонович', 'Шухратович', 'Носирович', 'Сухробович', 'Шавкатович',
  'Акмалович', 'Хамидович', 'Уткирович', 'Рустамович', 'Фахриддинович', 'Шерзодович', 'Бахтиёрович'
];

const PATRONYMICS_FEMALE = [
  'Дилшодовна', 'Бахтияровна', 'Анваровна', 'Рустамовна', 'Фарруховна', 'Иброхимовна',
  'Улугбековна', 'Олимжоновна', 'Баходировна', 'Исламовна', 'Жасуровна', 'Шерзодовна',
  'Комиловна', 'Нодировна', 'Шокировна', 'Искандаровна', 'Шухратовна', 'Ахмедовна'
];

const MAKHALAS = [
  'Буюк Ипак Йўли', 'Олий Ҳиммат', 'Шаҳриобод', 'Авайхон',
  'Дархон', 'Феруза', 'Қорасув', 'Ҳумо'
];

interface ProfileTemplate {
  status: EmploymentStatus;
  activity: string;
  education: EducationLevel;
  specialty: string;
  skills: string[];
  isNeet: boolean;
  neetState: 'pending_verification' | 'verified' | 'rejected';
  needsSupport: boolean;
  recs: string[];
  note: string;
  historyText: string;
}

const TEMPLATES: ProfileTemplate[] = [
  {
    status: 'безработный',
    activity: 'нет деятельности',
    education: 'Среднее',
    specialty: 'Школьное образование',
    skills: ['Физическая работа', 'Смартфон'],
    isNeet: true,
    neetState: 'pending_verification',
    needsSupport: true,
    recs: ['prog_ishga_marhamat_tech', 'prog_district_job_fair'],
    note: 'Не поступил в ВУЗ, официально не трудоустроен. Требуется выездной опрос.',
    historyText: 'Выявлен алгоритмом: отсутствие налоговых отчислений > 6 мес.'
  },
  {
    status: 'безработный',
    activity: 'нет деятельности',
    education: 'Средне-специальное',
    specialty: 'Автослесарь / Автоэлектрик',
    skills: ['Диагностика авто', 'Электропроводка', 'Водительские права B'],
    isNeet: true,
    neetState: 'verified',
    needsSupport: true,
    recs: ['prog_ishga_marhamat_tech', 'prog_micro_credit_biz'],
    note: 'Верифицирован лидером махалли. Желает повысить квалификацию в Моноцентре.',
    historyText: 'Окончание колледжа → поиск работы → верификация статуса NEET'
  },
  {
    status: 'занят',
    activity: 'IT и цифровые сервисы',
    education: 'Высшее',
    specialty: 'Программная инженерия (ТАТУ)',
    skills: ['React', 'TypeScript', 'Node.js', 'English B2'],
    isNeet: false,
    neetState: 'rejected',
    needsSupport: false,
    recs: ['prog_it_park_bootcamp'],
    note: 'Работает разработчиком в IT-компании, резидент IT-Park.',
    historyText: 'Обучение в ТАТУ → Стажировка в IT-Park → Официальное трудоустройство'
  },
  {
    status: 'предприниматель',
    activity: 'Услуги и пошив одежды',
    education: 'Средне-специальное',
    specialty: 'Дизайнер-модельер',
    skills: ['Пошив одежды', 'Швейное оборудование', 'SMM продвижение'],
    isNeet: false,
    neetState: 'rejected',
    needsSupport: false,
    recs: ['prog_yoshlar_daftari_grant', 'prog_micro_credit_biz'],
    note: 'Получила субсидию «Ёшлар Дафтари», открыла швейный цех на 3 рабочих места.',
    historyText: 'Обращение к лидеру молодёжи → Субсидия на швейную машину → Регистрация ИП'
  },
  {
    status: 'обучается',
    activity: 'Высшее образование',
    education: 'Неоконченное высшее',
    specialty: 'Экономика и финансы (ТГЭУ)',
    skills: ['Финансовый анализ', 'Excel Pro', '1С:Предприятие'],
    isNeet: false,
    neetState: 'rejected',
    needsSupport: false,
    recs: ['prog_district_job_fair'],
    note: 'Студент 3 курса дневного отделения ТГЭУ.',
    historyText: 'Поступление в ТГЭУ на грант'
  },
  {
    status: 'направлен на обучение',
    activity: 'Зеленая энергетика и монтаж',
    education: 'Средне-специальное',
    specialty: 'Электромонтажник',
    skills: ['Монтаж солнечных панелей', 'Инверторы', 'Электробезопасность'],
    isNeet: false,
    neetState: 'verified',
    needsSupport: true,
    recs: ['prog_ishga_marhamat_tech'],
    note: 'Зачислен в Моноцентр «Ишга Мархамат», получает государственную стипендию.',
    historyText: 'Безработный → Выявлен NEET → Направлен в Моноцентр «Ишга Мархамат»'
  },
  {
    status: 'занят',
    activity: 'Торговля и логистика',
    education: 'Средне-специальное',
    specialty: 'Складская логистика',
    skills: ['WMS системы', 'Учет ТМЦ', 'Погрузочная техника'],
    isNeet: false,
    neetState: 'rejected',
    needsSupport: false,
    recs: [],
    note: 'Старший кладовщик в распределительном центре ритейл-сети.',
    historyText: 'Трудоустройство через районную ярмарку вакансий'
  },
  {
    status: 'безработный',
    activity: 'нет деятельности',
    education: 'Высшее',
    specialty: 'Филология и языки (УзГУМЯ)',
    skills: ['Английский C1', 'Узбекский', 'Русский', 'Переводы'],
    isNeet: true,
    neetState: 'pending_verification',
    needsSupport: true,
    recs: ['prog_lang_center_sub', 'prog_district_job_fair'],
    note: 'Выпускница ВУЗа 2025 г., ищет работу преподавателем или переводчиком.',
    historyText: 'Окончание УзГУМЯ → поиск работы → внесена в базу ЦЗН'
  },
  {
    status: 'предприниматель',
    activity: 'Общественное питание и кофе',
    education: 'Среднее',
    specialty: 'Бариста / Управление кофейней',
    skills: ['Кофейное оборудование', 'Калькуляция', 'Сервис'],
    isNeet: false,
    neetState: 'rejected',
    needsSupport: false,
    recs: ['prog_micro_credit_biz'],
    note: 'Владелец мобильной кофейни в махалле, оформил самозанятость.',
    historyText: 'Регистрация самозанятости через приложение Soliq'
  },
  {
    status: 'не уточнено',
    activity: 'неизвестно',
    education: 'Среднее',
    specialty: '—',
    skills: ['Строительные работы'],
    isNeet: true,
    neetState: 'pending_verification',
    needsSupport: true,
    recs: ['prog_district_job_fair', 'prog_ishga_marhamat_tech'],
    note: 'Не проживает по прописке, соседи сообщают о временных заработках. Требуется уточнение.',
    historyText: 'Маркер системы: отсутствие данных переписи молодёжи'
  },
  {
    status: 'занят',
    activity: 'Здравоохранение и медицина',
    education: 'Высшее',
    specialty: 'Педиатрия (ТашПМИ)',
    skills: ['Диагностика', 'Первая помощь', 'Медицинская документация'],
    isNeet: false,
    neetState: 'rejected',
    needsSupport: false,
    recs: [],
    note: 'Врач-ординатор семейной поликлиники Мирзо-Улугбекского района.',
    historyText: 'Окончание ТашПМИ → Трудоустройство в поликлинику'
  },
  {
    status: 'направлен на обучение',
    activity: 'IT-разработка и мобилография',
    education: 'Среднее',
    specialty: '—',
    skills: ['Монтаж видео', 'SMM', 'Canva / CapCut'],
    isNeet: false,
    neetState: 'verified',
    needsSupport: true,
    recs: ['prog_it_park_bootcamp'],
    note: 'Проходит ускоренный курс по гранту фонда «IT-Bilim».',
    historyText: 'Безработный → Обращение в махаллю → Направлен в IT-Park'
  }
];

function generate100Profiles(): YouthProfile[] {
  const list: YouthProfile[] = [];

  for (let i = 1; i <= 100; i++) {
    const isFemale = i % 2 === 0;
    const gender: Gender = isFemale ? 'Женский' : 'Мужской';

    const firstNames = isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE;
    const lastNames = isFemale ? LAST_NAMES_FEMALE : LAST_NAMES_MALE;
    const patronymics = isFemale ? PATRONYMICS_FEMALE : PATRONYMICS_MALE;

    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[(i * 3) % lastNames.length];
    const patronymic = patronymics[(i * 7) % patronymics.length];

    const fullName = `${lastName} ${firstName} ${patronymic}`;
    const makhalla = MAKHALAS[i % MAKHALAS.length];
    const age = 18 + ((i * 7) % 13); // Range 18 to 30

    const phoneCode = [90, 91, 93, 94, 95, 97, 98, 99][i % 8];
    const p1 = String((i * 37) % 900 + 100);
    const p2 = String((i * 19) % 90 + 10);
    const p3 = String((i * 53) % 90 + 10);
    const phone = `+998 (${phoneCode}) ${p1}-${p2}-${p3}`;

    const template = TEMPLATES[i % TEMPLATES.length];

    const idStr = i < 10 ? `y_00${i}` : i < 100 ? `y_0${i}` : `y_${i}`;
    const day = (i % 28) + 1;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const month = i % 2 === 0 ? '05' : '06';
    const dateStr = `2026-${month}-${dayStr}`;

    const note = template.note
      .replace('Выпускница', isFemale ? 'Выпускница' : 'Выпускник')
      .replace('Получила', isFemale ? 'Получила' : 'Получил')
      .replace('Зачислен', isFemale ? 'Зачислена' : 'Зачислен')
      .replace('Владелец', isFemale ? 'Владелица' : 'Владелец');

    const historyText = template.historyText
      .replace('Безработный', isFemale ? 'Безработная' : 'Безработный')
      .replace('Выявлен', isFemale ? 'Выявлена' : 'Выявлен')
      .replace('Направлен', isFemale ? 'Направлена' : 'Направлен');

    list.push({
      id: idStr,
      full_name_demo: fullName,
      makhalla,
      age,
      gender,
      phone_demo: phone,
      employment_status: template.status,
      activity_type: template.activity,
      education: template.education,
      specialty: template.specialty,
      skills: template.skills,
      is_neet: template.isNeet,
      neet_verification: template.neetState,
      needs_support: template.needsSupport,
      support_recommendation: template.recs,
      last_updated: dateStr,
      notes: note,
      status_history: [
        {
          date: '2025-09-01',
          status: 'обучается',
          comment: 'Предыдущий зафиксированный статус'
        },
        {
          date: dateStr,
          status: template.status,
          comment: historyText
        }
      ]
    });
  }

  return list;
}

export const INITIAL_YOUTH_DATA: YouthProfile[] = generate100Profiles();
