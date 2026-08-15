import { MakhallaStats, InfrastructurePOI } from '../types';

export const MAKHALLAS_LIST: MakhallaStats[] = [
  {
    id: 'm_buyuk_ipak',
    name: 'Буюк Ипак Йўли',
    totalYouth: 1840,
    employed: 1420,
    studying: 260,
    unemployed: 110,
    neetCount: 50,
    neetPending: 18,
    supportedCount: 42,
    employmentRate: 91.3,
    leaderName: 'Ахмедов Сардор Бахтиёрович',
    leaderPhone: '+998 (90) 123-45-67',
    riskLevel: 'low',
    coordinates: { x: 260, y: 140 },
    geoCenter: [41.3265, 69.3280],
    geoPolygon: [
      [41.3320, 69.3200],
      [41.3340, 69.3360],
      [41.3220, 69.3390],
      [41.3190, 69.3220]
    ]
  },
  {
    id: 'm_oliy_himmat',
    name: 'Олий Ҳиммат',
    totalYouth: 1420,
    employed: 920,
    studying: 210,
    unemployed: 190,
    neetCount: 100,
    neetPending: 34,
    supportedCount: 65,
    employmentRate: 79.5,
    leaderName: 'Каримова Гулноза Анваровна',
    leaderPhone: '+998 (93) 234-56-78',
    riskLevel: 'high',
    coordinates: { x: 180, y: 220 },
    geoCenter: [41.3210, 69.3420],
    geoPolygon: [
      [41.3250, 69.3350],
      [41.3260, 69.3510],
      [41.3150, 69.3500],
      [41.3140, 69.3360]
    ]
  },
  {
    id: 'm_shahriobod',
    name: 'Шаҳриобод',
    totalYouth: 1650,
    employed: 1250,
    studying: 240,
    unemployed: 110,
    neetCount: 50,
    neetPending: 12,
    supportedCount: 38,
    employmentRate: 90.3,
    leaderName: 'Юлдашев Жасур Комилович',
    leaderPhone: '+998 (97) 345-67-89',
    riskLevel: 'low',
    coordinates: { x: 340, y: 180 },
    geoCenter: [41.3320, 69.3450],
    geoPolygon: [
      [41.3370, 69.3380],
      [41.3380, 69.3550],
      [41.3270, 69.3540],
      [41.3260, 69.3370]
    ]
  },
  {
    id: 'm_avaykhon',
    name: 'Авайхон',
    totalYouth: 1280,
    employed: 890,
    studying: 190,
    unemployed: 140,
    neetCount: 60,
    neetPending: 22,
    supportedCount: 45,
    employmentRate: 84.3,
    leaderName: 'Рахимов Дилшод Шокирович',
    leaderPhone: '+998 (99) 456-78-90',
    riskLevel: 'medium',
    coordinates: { x: 210, y: 310 },
    geoCenter: [41.3410, 69.3390],
    geoPolygon: [
      [41.3460, 69.3310],
      [41.3470, 69.3480],
      [41.3360, 69.3470],
      [41.3350, 69.3300]
    ]
  },
  {
    id: 'm_darxon',
    name: 'Дархон',
    totalYouth: 2100,
    employed: 1720,
    studying: 290,
    unemployed: 60,
    neetCount: 30,
    neetPending: 8,
    supportedCount: 22,
    employmentRate: 95.7,
    leaderName: 'Умаров Фарход Нодирович',
    leaderPhone: '+998 (90) 567-89-01',
    riskLevel: 'low',
    coordinates: { x: 120, y: 110 },
    geoCenter: [41.3190, 69.2980],
    geoPolygon: [
      [41.3260, 69.2880],
      [41.3270, 69.3080],
      [41.3120, 69.3090],
      [41.3110, 69.2890]
    ]
  },
  {
    id: 'm_feruza',
    name: 'Феруза',
    totalYouth: 1530,
    employed: 1080,
    studying: 210,
    unemployed: 160,
    neetCount: 80,
    neetPending: 28,
    supportedCount: 54,
    employmentRate: 84.3,
    leaderName: 'Махмудов Бекзод Искандарович',
    leaderPhone: '+998 (94) 678-90-12',
    riskLevel: 'medium',
    coordinates: { x: 410, y: 130 },
    geoCenter: [41.3550, 69.3620],
    geoPolygon: [
      [41.3610, 69.3520],
      [41.3620, 69.3720],
      [41.3490, 69.3710],
      [41.3480, 69.3510]
    ]
  },
  {
    id: 'm_qorasuv',
    name: 'Қорасув',
    totalYouth: 1950,
    employed: 1390,
    studying: 280,
    unemployed: 180,
    neetCount: 100,
    neetPending: 39,
    supportedCount: 71,
    employmentRate: 85.6,
    leaderName: 'Исмаилова Нилуфар Шухратовна',
    leaderPhone: '+998 (91) 789-01-23',
    riskLevel: 'high',
    coordinates: { x: 380, y: 260 },
    geoCenter: [41.3480, 69.3550],
    geoPolygon: [
      [41.3540, 69.3460],
      [41.3550, 69.3660],
      [41.3420, 69.3650],
      [41.3410, 69.3450]
    ]
  },
  {
    id: 'm_humo',
    name: 'Ҳумо',
    totalYouth: 1190,
    employed: 910,
    studying: 180,
    unemployed: 70,
    neetCount: 30,
    neetPending: 9,
    supportedCount: 28,
    employmentRate: 91.5,
    leaderName: 'Алимов Шерзод Рустамович',
    leaderPhone: '+998 (95) 890-12-34',
    riskLevel: 'low',
    coordinates: { x: 290, y: 360 },
    geoCenter: [41.3620, 69.3750],
    geoPolygon: [
      [41.3680, 69.3650],
      [41.3690, 69.3850],
      [41.3560, 69.3840],
      [41.3550, 69.3640]
    ]
  }
];

export const DISTRICT_POI_LIST: InfrastructurePOI[] = [
  {
    id: 'poi_monocenter',
    name: 'Моноцентр «Ишга Мархамат» (Мирзо-Улугбек)',
    nameUz: '«Ishga Marhamat» Monomarkazi',
    category: 'monocenter',
    address: 'г. Ташкент, ул. Буюк Ипак Йули, 15',
    phone: '+998 (71) 207-69-00',
    coordinates: [41.3285, 69.3310],
    servicesCount: 24,
    descriptionRu: 'Государственный центр бесплатного профессионального обучения и переподготовки по 24 специальностям со стипендией.',
    descriptionUz: '24 ta mutaxassislik boʻyicha stipendiya bilan bepul kasb-hunarga oʻqitish va qayta tayyorlash davlat markazi.'
  },
  {
    id: 'poi_it_park',
    name: 'IT-Park Hub & Youth Digital Lab',
    nameUz: 'IT-Park Hub va Raqamli Laboratoriya',
    category: 'it_park',
    address: 'г. Ташкент, ул. Тепамасжид, 4',
    phone: '+998 (71) 209-11-99',
    coordinates: [41.3435, 69.3440],
    servicesCount: 16,
    descriptionRu: 'Курсы веб-разработки, QA, Python, Data Analytics со 100% субсидированием обучения и содействием в стажировках.',
    descriptionUz: 'Veb-dasturlash, QA, Python va Data Analytics boʻyicha 100% davlat subsidiya kurslari va amaliyotlar.'
  },
  {
    id: 'poi_employment_center',
    name: 'Районный Центр содействия занятости (АББМ)',
    nameUz: 'Aholi bandligiga koʻmaklashish markazi (ABKM)',
    category: 'employment_center',
    address: 'г. Ташкент, массив Карасу-1, 28',
    phone: '+998 (71) 263-44-12',
    coordinates: [41.3495, 69.3580],
    servicesCount: 12,
    descriptionRu: 'Официальная регистрация безработных, выдача направлений на работу, оформление субсидий на открытие самозанятости.',
    descriptionUz: 'Ishsizlarni rasmiy roʻyxatga olish, ishga yoʻllanma berish va oʻzini oʻzi band qilish subsidiyalari.'
  },
  {
    id: 'poi_youth_center',
    name: 'Молодёжный коворкинг «Келажак» & Фонд «Ёшлар Дафтари»',
    nameUz: '«Kelajak» Yoshlar kovorkingi va «Yoshlar Daftari»',
    category: 'youth_center',
    address: 'г. Ташкент, ул. Мустакиллик, 102',
    phone: '+998 (71) 241-02-02',
    coordinates: [41.3205, 69.3010],
    servicesCount: 8,
    descriptionRu: 'Бесплатное пространство для стартапов, консультации по грантам до 30 млн сум и программам льготного микрокредитования.',
    descriptionUz: 'Startaplar uchun bepul maydon, 30 mln soʻmgacha grantlar va imtiyozli mikrokredit konsultatsiyalari.'
  }
];

