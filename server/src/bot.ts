import { Bot, InlineKeyboard, Keyboard, InputFile } from 'grammy';
import { db } from './db.js';
import { EmploymentStatus, SupportProgram, YouthProfile } from './types.js';

const BOT_TOKEN = process.env.BOT_TOKEN || '8718296335:AAHAKWgSTNpoAB_bYT9kG_UUzRehj0_U1XI';

export const bot = new Bot(BOT_TOKEN);

// Auto-configure Telegram bot metadata
bot.api.setMyName('Ёшлар Бандлиги').catch(() => {});
bot.api.setMyDescription(
  '🏛 Мобильное рабочее место Лидера молодёжи («Ёшлар етакчиси») Мирзо-Улугбекского района г. Ташкента.\n\n• ⚡️ Подомовой NEET триаж и верификация\n• ➕ Регистрация новых молодых граждан\n• 📥 Выгрузка базы данных в Excel (.xlsx/.csv)\n• 📊 Мониторинг занятости в реальном времени'
).catch(() => {});
bot.api.setMyShortDescription(
  'Система мониторинга занятости и NEET триажа Мирзо-Улугбекского района'
).catch(() => {});

// User sessions in-memory
interface UserSession {
  lang: 'ru' | 'uz';
  mahalla: string;
  wizardState?: 'awaiting_name' | 'awaiting_age' | 'awaiting_phone' | 'awaiting_status' | 'awaiting_search';
  newYouthDraft?: Partial<YouthProfile>;
  currentTriageIndex?: number;
  registryFilter?: 'all' | 'neet' | 'employed' | 'studying';
}

const sessions: Map<number, UserSession> = new Map();

function getSession(userId: number): UserSession {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      lang: 'ru', // Default to Russian as requested
      mahalla: 'Буюк Ипак Йўли',
      currentTriageIndex: 0,
      registryFilter: 'all'
    });
  }
  return sessions.get(userId)!;
}

// Broadcaster callback injected from server
type Broadcaster = (type: string, messageRu: string, messageUz: string, mahalla: string, author: string, youth?: YouthProfile) => void;
let broadcaster: Broadcaster | null = null;

export function setBroadcaster(fn: Broadcaster) {
  broadcaster = fn;
}

function notifyRealtime(type: string, messageRu: string, messageUz: string, mahalla: string, author: string, youth?: YouthProfile) {
  db.addEvent({
    type: type as any,
    mahalla,
    author,
    messageRu,
    messageUz,
    youth
  });

  if (broadcaster) {
    broadcaster(type, messageRu, messageUz, mahalla, author, youth);
  }
}

const MAHALLAS = [
  'Буюк Ипак Йўли',
  'Олий Ҳиммат',
  'Шаҳриобод',
  'Авайхон',
  'Дархон',
  'Феруза',
  'Қорасув',
  'Ҳумо'
];

// Helper: Visual progress bar
function renderProgressBar(percentage: number, length = 10): string {
  const filled = Math.min(length, Math.max(0, Math.round((percentage / 100) * length)));
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// Helper: Generate UTF-8 CSV Buffer with Excel BOM for Russian/Uzbek text
function generateYouthCsvBuffer(youthList: YouthProfile[]): Buffer {
  const headers = [
    'ID',
    'ФИО',
    'Махалля',
    'Возраст',
    'Пол',
    'Телефон',
    'Статус занятости',
    'Образование',
    'Специальность',
    'Навыки',
    'Категория NEET',
    'Статус верификации',
    'Назначенная программа',
    'Дата обновления',
    'Примечания'
  ];

  const rows = youthList.map(y => [
    `"${y.id}"`,
    `"${y.full_name_demo.replace(/"/g, '""')}"`,
    `"${y.makhalla.replace(/"/g, '""')}"`,
    y.age,
    `"${y.gender}"`,
    `"${y.phone_demo}"`,
    `"${y.employment_status}"`,
    `"${y.education}"`,
    `"${(y.specialty || '').replace(/"/g, '""')}"`,
    `"${(y.skills || []).join(', ').replace(/"/g, '""')}"`,
    y.is_neet ? '"Да (NEET)"' : '"Нет"',
    `"${y.neet_verification}"`,
    `"${(y.assigned_program?.title || 'Не назначена').replace(/"/g, '""')}"`,
    `"${y.last_updated}"`,
    `"${(y.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(';'),
    ...rows.map(r => r.join(';'))
  ].join('\r\n');

  return Buffer.from(csvContent, 'utf-8');
}

// Clean, logical reply keyboard
function getMainMenuKeyboard(lang: 'ru' | 'uz') {
  if (lang === 'uz') {
    return new Keyboard()
      .text('⚡️ NEET Триаж (Подомовой обход)').text('➕ Янги ёшни қўшиш').row()
      .text('📊 Маҳалла статистикаси').text('📋 Ёшлар реестри').row()
      .text('📥 Экселда юклаб олиш (.xlsx)').text('📑 Ҳокимга ҳисобот').row()
      .text('📍 Маҳаллани танлаш').text('⚙️ Созламалар (Тил/Инфо)').row()
      .resized();
  }
  return new Keyboard()
    .text('⚡️ NEET Триаж (Подомовой обход)').text('➕ Добавить гражданина').row()
    .text('📊 Статистика махалли').text('📋 Реестр молодёжи').row()
    .text('📥 Скачать Excel (.xlsx)').text('📑 Отчёт для Хокима').row()
    .text('📍 Выбрать махаллю').text('⚙️ Настройки и язык').row()
    .resized();
}

// 1. START COMMAND
bot.command(['start', 'menu', 'help'], async (ctx) => {
  const session = getSession(ctx.from!.id);
  session.wizardState = undefined;
  session.newYouthDraft = undefined;

  if (session.lang === 'uz') {
    const textUz = `🏛 <b>«Ёшлар Бандлиги» тизимига хуш келибсиз!</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 Сиз Мирзо Улуғбек тумани <b>«Ёшлар етакчиси»</b> мобил ишчи ўрнига уландингиз.\n\n` +
      `📍 Танланган маҳалла: <b>«${session.mahalla}»</b>\n\n` +
      `⚡️ <b>Асосий функциялар:</b>\n` +
      `• <b>NEET Триаж</b> — хонадонбай сўров ва ҳолатни верификация қилиш\n` +
      `• <b>Рўйхатга олиш</b> — янги фуқароларни зудлик билан базага киритиш\n` +
      `• <b>Excel юклаб олиш</b> — реестрни жадвал шаклида олиш\n` +
      `• <b>Ҳокимга ҳисобот</b> — расмий таҳлилий маълумотнома яратиш\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💡 <i>Барча маълумотлар реал вақтда Ҳокимият ситуацион марказига узатилади!</i>`;

    return ctx.reply(textUz, {
      parse_mode: 'HTML',
      reply_markup: getMainMenuKeyboard(session.lang)
    });
  }

  const textRu = `🏛 <b>Добро пожаловать в систему «Ёшлар Бандлиги»!</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 Мобильное рабочее место <b>«Ёшлар етакчиси»</b> (Лидера молодёжи) Мирзо-Улугбекского района.\n\n` +
    `📍 Активная махалля: <b>«${session.mahalla}»</b>\n\n` +
    `⚡️ <b>Ключевые возможности:</b>\n` +
    `• <b>NEET Триаж</b> — подомовой обход и оперативная верификация статуса\n` +
    `• <b>Регистрация</b> — внесение новых молодых граждан в реестр\n` +
    `• <b>Скачивание Excel</b> — экспорт базы данных в формате .xlsx/.csv\n` +
    `• <b>Отчёт для Хокима</b> — автоматическое формирование служебной записки\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💡 <i>Все действия мгновенно синхронизируются с дашбордом Хокимията!</i>`;

  await ctx.reply(textRu, {
    parse_mode: 'HTML',
    reply_markup: getMainMenuKeyboard(session.lang)
  });
});

// 2. EXCEL DOWNLOAD HANDLER
bot.hears(['📥 Скачать Excel (.xlsx)', '📥 Экселда юклаб олиш (.xlsx)', '/export', '/excel'], async (ctx) => {
  const session = getSession(ctx.from!.id);

  const kb = new InlineKeyboard()
    .text(session.lang === 'uz' ? `📍 Фақат «${session.mahalla}»` : `📍 Только «${session.mahalla}»`, 'exp_mahalla').row()
    .text(session.lang === 'uz' ? '🌐 Бутун туман (Барча 8 маҳалла)' : '🌐 Весь район (Все 8 махаллей)', 'exp_all');

  const text = session.lang === 'uz'
    ? `📥 <b>Экселда маълумотларни юклаб олиш:</b>\n\nҚайси қамровдаги рўйхатни юклаб олмоқчисиз?`
    : `📥 <b>Экспорт реестра молодёжи в Excel:</b>\n\nВыберите охват данных для выгрузки:`;

  await ctx.reply(text, { parse_mode: 'HTML', reply_markup: kb });
});

bot.callbackQuery('exp_mahalla', async (ctx) => {
  const session = getSession(ctx.from.id);
  const youthList = db.getYouthByMahalla(session.mahalla);
  
  await ctx.answerCallbackQuery({ text: 'Генерация файла...' });
  
  const buffer = generateYouthCsvBuffer(youthList);
  const dateStr = new Date().toISOString().split('T')[0];
  const safeName = session.mahalla.replace(/\s+/g, '_');
  const filename = `Реестр_молодежи_${safeName}_${dateStr}.csv`;

  const caption = session.lang === 'uz'
    ? `📥 <b>«${session.mahalla}» маҳалласи реестри</b>\n━━━━━━━━━━━━━━━━━━━━\n👥 Ёшлар сони: <b>${youthList.length} нафар</b>\n📅 Сана: <b>${dateStr}</b>\n⚡️ <i>Файл Excel ва 1С билан тўлиқ мос келади.</i>`
    : `📥 <b>Реестр молодёжи махалли «${session.mahalla}»</b>\n━━━━━━━━━━━━━━━━━━━━\n👥 Всего записей: <b>${youthList.length} чел.</b>\n📅 Дата выгрузки: <b>${dateStr}</b>\n⚡️ <i>Файл полностью совместим с Excel, Google Таблицами и 1С.</i>`;

  await ctx.replyWithDocument(new InputFile(buffer, filename), {
    caption,
    parse_mode: 'HTML'
  });
});

bot.callbackQuery('exp_all', async (ctx) => {
  const session = getSession(ctx.from.id);
  const youthList = db.getAllYouth();
  
  await ctx.answerCallbackQuery({ text: 'Генерация файла всего района...' });
  
  const buffer = generateYouthCsvBuffer(youthList);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Реестр_молодежи_Мирзо_Улугбек_${dateStr}.csv`;

  const caption = session.lang === 'uz'
    ? `📥 <b>Мирзо Улуғбек тумани тўлиқ реестри (8 та маҳалла)</b>\n━━━━━━━━━━━━━━━━━━━━\n👥 Жами ёшлар: <b>${youthList.length} нафар</b>\n📅 Сана: <b>${dateStr}</b>\n⚡️ <i>Файл Excel ва 1С билан тўлиқ мос келади.</i>`
    : `📥 <b>Полный реестр молодёжи Мирзо-Улугбекского района (8 махаллей)</b>\n━━━━━━━━━━━━━━━━━━━━\n👥 Всего в базе: <b>${youthList.length} чел.</b>\n📅 Дата выгрузки: <b>${dateStr}</b>\n⚡️ <i>Файл полностью совместим с Excel, Google Таблицами и 1С.</i>`;

  await ctx.replyWithDocument(new InputFile(buffer, filename), {
    caption,
    parse_mode: 'HTML'
  });
});

// 3. STATS & ANALYTICS HANDLER
bot.hears(['📊 Маҳалла статистикаси', '📊 Статистика махалли', '/stats'], async (ctx) => {
  const session = getSession(ctx.from!.id);
  const youthList = db.getYouthByMahalla(session.mahalla);
  const total = youthList.length;
  const employed = youthList.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель').length;
  const studying = youthList.filter(y => y.employment_status === 'обучается' || y.employment_status === 'направлен на обучение').length;
  const unemployed = youthList.filter(y => y.employment_status === 'безработный' && !y.is_neet).length;
  const neet = youthList.filter(y => y.is_neet).length;
  const pending = youthList.filter(y => y.neet_verification === 'pending_verification').length;
  const supported = youthList.filter(y => !!y.assigned_program).length;
  const rate = total ? Math.round(((employed + studying) / total) * 100) : 0;
  const progressBar = renderProgressBar(rate);

  const kb = new InlineKeyboard()
    .text(session.lang === 'uz' ? '⚡️ Триажни бошлаш' : '⚡️ Начать триаж NEET', 'start_triage_btn')
    .text(session.lang === 'uz' ? '📥 Экспорт' : '📥 Скачать Excel', 'exp_mahalla').row()
    .text(session.lang === 'uz' ? '🌐 Бутун туман бўйича статистика' : '🌐 Статистика по всему району', 'stats_district');

  let msg = '';
  if (session.lang === 'uz') {
    msg = `📊 <b>«${session.mahalla}» маҳалласи паспорти</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📈 <b>Бандлик даражаси: ${rate}%</b>\n` +
      `<code>${progressBar}</code>\n\n` +
      `👥 Жами ҳисобдаги ёшлар: <b>${total} нафар</b>\n` +
      `🟢 Иш билан бандлар / Бизнес: <b>${employed} нафар</b>\n` +
      `🔵 Талабалар / Ўқувчилар: <b>${studying} нафар</b>\n` +
      `🟡 Расмий ишсизлар: <b>${unemployed} нафар</b>\n` +
      `🔴 NEET хавф гуруҳи: <b>${neet} нафар</b> (Кутмоқда: <b>${pending}</b>)\n` +
      `🎓 Дастурларга бириктирилган: <b>${supported} нафар</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `⚡️ <i>Ситуацион марказ билан онлайн синхронланган.</i>`;
  } else {
    msg = `📊 <b>Паспорт занятости махалли «${session.mahalla}»</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📈 <b>Уровень занятости: ${rate}%</b>\n` +
      `<code>${progressBar}</code>\n\n` +
      `👥 Всего молодёжи на учёте: <b>${total} чел.</b>\n` +
      `🟢 Занятые / Предприниматели: <b>${employed} чел.</b>\n` +
      `🔵 Обучаются (вузы / курсы): <b>${studying} чел.</b>\n` +
      `🟡 Безработные: <b>${unemployed} чел.</b>\n` +
      `🔴 В группе риска NEET: <b>${neet} чел.</b> (На проверке: <b>${pending}</b>)\n` +
      `🎓 Получили господдержку: <b>${supported} чел.</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `⚡️ <i>Синхронизировано с ситуационным центром Хокимията онлайн.</i>`;
  }

  await ctx.reply(msg, { parse_mode: 'HTML', reply_markup: kb });
});

bot.callbackQuery('stats_district', async (ctx) => {
  const session = getSession(ctx.from.id);
  const stats = db.getStats();
  const allYouth = db.getAllYouth();
  const progressBar = renderProgressBar(Math.round(stats.employmentRate));

  const text = session.lang === 'uz'
    ? `🌐 <b>Мирзо Улуғбек тумани — Умумий статистика</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📈 <b>Умумий бандлик: ${stats.employmentRate}%</b>\n` +
      `<code>${progressBar}</code>\n\n` +
      `👥 Барча ёшлар: <b>${stats.total} нафар</b>\n` +
      `🟢 Бандлар: <b>${stats.employed} нафар</b>\n` +
      `🔵 Ўқиётганлар: <b>${stats.studying} нафар</b>\n` +
      `🔴 Жами NEET ҳолатида: <b>${stats.neet} нафар</b>\n` +
      `⏳ Текширув кутаётганлар: <b>${stats.neetPending} нафар</b>\n` +
      `🎓 Дастурлар билан қамралган: <b>${stats.supported} нафар</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━`
    : `🌐 <b>Мирзо-Улугбекский район — Сводная аналитика</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📈 <b>Средняя занятость: ${stats.employmentRate}%</b>\n` +
      `<code>${progressBar}</code>\n\n` +
      `👥 Всего молодёжи (18–30): <b>${stats.total} чел.</b>\n` +
      `🟢 Занятые / Бизнес: <b>${stats.employed} чел.</b>\n` +
      `🔵 Обучающиеся: <b>${stats.studying} чел.</b>\n` +
      `🔴 Всего в группе NEET: <b>${stats.neet} чел.</b>\n` +
      `⏳ Ожидают подомового обхода: <b>${stats.neetPending} чел.</b>\n` +
      `🎓 Охвачены мерами поддержки: <b>${stats.supported} чел.</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━`;

  await ctx.answerCallbackQuery();
  await ctx.reply(text, { parse_mode: 'HTML' });
});

// 4. REPORT FOR HOKIM (Служебная записка)
bot.hears(['📑 Ҳокимга ҳисобот', '📑 Отчёт для Хокима', '/report'], async (ctx) => {
  const session = getSession(ctx.from!.id);
  const stats = db.getStats();
  const allYouth = db.getAllYouth();
  const dateStr = new Date().toLocaleDateString(session.lang === 'uz' ? 'uz-UZ' : 'ru-RU');

  // Find mahallas with highest NEET count
  const mahallaNeetCounts = MAHALLAS.map(m => {
    const list = db.getYouthByMahalla(m);
    const neetCount = list.filter(y => y.is_neet).length;
    return { name: m, neetCount, total: list.length };
  }).sort((a, b) => b.neetCount - a.neetCount);

  const top3 = mahallaNeetCounts.slice(0, 3);
  const topListStr = top3.map((m, idx) => `  ${idx + 1}. Махалля «${m.name}» — <b>${m.neetCount}</b> кандидатов NEET`).join('\n');

  let reportText = '';
  if (session.lang === 'uz') {
    reportText = `🏛 <b>МИРЗО УЛУҒБЕК ТУМАНИ ҲОКИМИГА ҲИСОБОТ</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 Сана: <b>${dateStr}</b>\n` +
      `📋 Ҳужжат: <b>Ёшлар бандлиги бўйича тезкор маълумотнома</b>\n\n` +
      `📌 <b>1. Асосий кўрсаткичлар:</b>\n` +
      `• Ҳисобдаги ёшлар сони: <b>${stats.total} нафар</b>\n` +
      `• Туман бўйича бандлик: <b>${stats.employmentRate}%</b>\n` +
      `• NEET хавф гуруҳи: <b>${stats.neet} нафар</b>\n` +
      `• Триажда текширилган: <b>${stats.total - stats.neetPending} нафар</b>\n\n` +
      `⚠️ <b>2. Энг кўп NEET хавфи бўлган маҳаллалар:</b>\n${topListStr}\n\n` +
      `💡 <b>3. Тавсия этиладиган чоралар:</b>\n` +
      `• «Ишга марҳамат» мономарказига йўлланмалар: <b>20 квота</b>\n` +
      `• «Ёшлар дафтари» субсидиялари: <b>100 млн сўм ажратиш</b>\n` +
      `• IT-Park курслари учун грантлар: <b>10 нафар</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `⚡️ <i>Ҳисобот суверен ИИ ситуацион маркази томонидан шакллантирилди.</i>`;
  } else {
    reportText = `🏛 <b>СЛУЖЕБНАЯ ЗАПИСКА ДЛЯ ХОКИМА РАЙОНА</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 Дата: <b>${dateStr}</b>\n` +
      `📋 Документ: <b>Оперативная сводка по занятости молодёжи</b>\n\n` +
      `📌 <b>1. Ключевые показатели района:</b>\n` +
      `• Всего на учёте (18–30 лет): <b>${stats.total} чел.</b>\n` +
      `• Общий уровень занятости: <b>${stats.employmentRate}%</b>\n` +
      `• Выявлено в зоне риска NEET: <b>${stats.neet} чел.</b>\n` +
      `• Прошли верификацию: <b>${stats.total - stats.neetPending} чел.</b>\n\n` +
      `⚠️ <b>2. Очаги риска NEET по махаллям:</b>\n${topListStr}\n\n` +
      `💡 <b>3. Рекомендуемые приоритетные меры:</b>\n` +
      `• Выделение квот в Моноцентр «Ишга Мархамат»: <b>20 мест</b>\n` +
      `• Выделение субсидий по линии «Ёшлар Дафтари»: <b>до 100 млн сум</b>\n` +
      `• Направление на IT-курсы IT-Park: <b>10 грантов</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `⚡️ <i>Сформировано алгоритмом ситуационного центра в реальном времени.</i>`;
  }

  const kb = new InlineKeyboard()
    .text(session.lang === 'uz' ? '📥 Экселда тўлиқ базани юклаш' : '📥 Скачать базу в Excel', 'exp_all');

  await ctx.reply(reportText, { parse_mode: 'HTML', reply_markup: kb });
});

// 5. YOUTH REGISTRY LIST & SEARCH
bot.hears(['📋 Ёшлар реестри', '📋 Реестр молодёжи', '/list'], async (ctx) => {
  const session = getSession(ctx.from!.id);
  session.registryFilter = 'all';
  await sendRegistryList(ctx);
});

async function sendRegistryList(ctx: any) {
  const session = getSession(ctx.from.id);
  const youthInMahalla = db.getYouthByMahalla(session.mahalla);

  let filtered = youthInMahalla;
  if (session.registryFilter === 'neet') {
    filtered = youthInMahalla.filter(y => y.is_neet);
  } else if (session.registryFilter === 'employed') {
    filtered = youthInMahalla.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель');
  } else if (session.registryFilter === 'studying') {
    filtered = youthInMahalla.filter(y => y.employment_status === 'обучается' || y.employment_status === 'направлен на обучение');
  }

  const listItems = filtered.slice(0, 8).map((y, idx) => {
    const icon = y.employment_status === 'занят' || y.employment_status === 'предприниматель' 
      ? '🟢' 
      : y.employment_status === 'обучается' || y.employment_status === 'направлен на обучение'
      ? '🔵' 
      : y.is_neet 
      ? '🔴' 
      : '🟡';
    return `${idx + 1}. ${icon} <b>${y.full_name_demo}</b> (${y.age} лет)\n   └ <i>${y.employment_status} • 📞 ${y.phone_demo}</i>`;
  }).join('\n\n');

  const filterLabel = session.registryFilter === 'neet' 
    ? '🔴 Только NEET' 
    : session.registryFilter === 'employed' 
    ? '🟢 Занятые' 
    : session.registryFilter === 'studying' 
    ? '🔵 Обучаются' 
    : 'Все';

  const text = session.lang === 'uz'
    ? `📋 <b>«${session.mahalla}» ёшлар реестри [${filterLabel}]</b>\n━━━━━━━━━━━━━━━━━━━━\nЖами топилди: <b>${filtered.length} нафар</b>\n\n${listItems || 'Ҳозирча рўйхат бўш'}\n━━━━━━━━━━━━━━━━━━━━`
    : `📋 <b>Реестр молодёжи «${session.mahalla}» [${filterLabel}]</b>\n━━━━━━━━━━━━━━━━━━━━\nНайдено: <b>${filtered.length} чел.</b>\n\n${listItems || 'Список пуст'}\n━━━━━━━━━━━━━━━━━━━━`;

  const kb = new InlineKeyboard()
    .text(session.registryFilter === 'all' ? '• Все •' : 'Все', 'reg_f:all')
    .text(session.registryFilter === 'neet' ? '• 🔴 NEET •' : '🔴 NEET', 'reg_f:neet')
    .text(session.registryFilter === 'employed' ? '• 🟢 Занятые •' : '🟢 Занятые', 'reg_f:employed')
    .text(session.registryFilter === 'studying' ? '• 🔵 Учатся •' : '🔵 Учатся', 'reg_f:studying').row()
    .text(session.lang === 'uz' ? '📥 Экселда юклаш' : '📥 Скачать Excel', 'exp_mahalla');

  await ctx.reply(text, { parse_mode: 'HTML', reply_markup: kb });
}

bot.callbackQuery(/^reg_f:(all|neet|employed|studying)$/, async (ctx) => {
  const session = getSession(ctx.from.id);
  session.registryFilter = ctx.match[1] as any;
  await ctx.answerCallbackQuery();
  await sendRegistryList(ctx);
});

// 6. MAHALLA SWITCHER
bot.hears(['📍 Маҳаллани танлаш', '📍 Выбрать махаллю', '/mahalla'], async (ctx) => {
  const session = getSession(ctx.from!.id);
  const kb = new InlineKeyboard();
  
  MAHALLAS.forEach((m, idx) => {
    kb.text(m === session.mahalla ? `✅ ${m}` : m, `set_makhalla:${m}`);
    if (idx % 2 === 1) kb.row();
  });

  const text = session.lang === 'uz'
    ? `📍 <b>Ҳудудни танланг:</b>\nҲозирги маҳалла: <b>«${session.mahalla}»</b>\n\nСиз ишлаётган маҳаллани танланг:`
    : `📍 <b>Выбор махалли:</b>\nТекущая махалля: <b>«${session.mahalla}»</b>\n\nВыберите махаллю для работы:`;

  await ctx.reply(text, { parse_mode: 'HTML', reply_markup: kb });
});

bot.callbackQuery(/^set_makhalla:(.+)$/, async (ctx) => {
  const session = getSession(ctx.from.id);
  const newMahalla = ctx.match[1];
  session.mahalla = newMahalla;
  session.currentTriageIndex = 0;
  
  await ctx.answerCallbackQuery({ text: `Махалля: ${newMahalla}` });

  await ctx.editMessageText(
    session.lang === 'uz'
      ? `✅ Маҳалла муваффақиятли танланди: <b>«${newMahalla}»</b>`
      : `✅ Активная махалля успешно изменена на: <b>«${newMahalla}»</b>`,
    { parse_mode: 'HTML' }
  );

  await ctx.reply(
    session.lang === 'uz' ? 'Асосий менюдан керакли амални танланг:' : 'Выберите действие в главном меню:',
    { reply_markup: getMainMenuKeyboard(session.lang) }
  );
});

// 7. SETTINGS & LANGUAGE
bot.hears(['⚙️ Созламалар (Тил/Инфо)', '⚙️ Настройки и язык', '/settings'], async (ctx) => {
  const session = getSession(ctx.from!.id);

  const kb = new InlineKeyboard()
    .text(session.lang === 'ru' ? '🇷🇺 Русский (активен ✅)' : '🇷🇺 Русский', 'set_lang:ru')
    .text(session.lang === 'uz' ? '🇺🇿 O‘zbekcha (faol ✅)' : '🇺🇿 O‘zbekcha', 'set_lang:uz').row()
    .text('📍 Сменить махаллю', 'open_mahalla_menu');

  const text = session.lang === 'uz'
    ? `⚙️ <b>Созламалар ва тизим маълумотлари</b>\n━━━━━━━━━━━━━━━━━━━━\n📍 Маҳалла: <b>«${session.mahalla}»</b>\n🌐 Тил: <b>Ўзбекча</b>\n🤖 Бот версияси: <b>2.4.0 Live-Sync</b>\n━━━━━━━━━━━━━━━━━━━━\nТилни ўзгартириш учун танланг:`
    : `⚙️ <b>Настройки и параметры системы</b>\n━━━━━━━━━━━━━━━━━━━━\n📍 Активная махалля: <b>«${session.mahalla}»</b>\n🌐 Язык интерфейса: <b>Русский</b>\n🤖 Версия бота: <b>2.4.0 Live-Sync</b>\n━━━━━━━━━━━━━━━━━━━━\nДля смены языка нажмите кнопку ниже:`;

  await ctx.reply(text, { parse_mode: 'HTML', reply_markup: kb });
});

bot.callbackQuery('open_mahalla_menu', async (ctx) => {
  const session = getSession(ctx.from.id);
  const kb = new InlineKeyboard();
  MAHALLAS.forEach((m, idx) => {
    kb.text(m === session.mahalla ? `✅ ${m}` : m, `set_makhalla:${m}`);
    if (idx % 2 === 1) kb.row();
  });
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    session.lang === 'uz' ? '📍 Маҳаллани танланг:' : '📍 Выберите махаллю:',
    { reply_markup: kb }
  );
});

bot.callbackQuery(/^set_lang:(uz|ru)$/, async (ctx) => {
  const session = getSession(ctx.from.id);
  session.lang = ctx.match[1] as 'uz' | 'ru';
  await ctx.answerCallbackQuery({ text: session.lang === 'ru' ? 'Язык: Русский' : 'Til: O‘zbekcha' });
  
  await ctx.reply(
    session.lang === 'ru' ? '🇷🇺 Язык интерфейса успешно переключен на русский.' : '🇺🇿 Til o‘zbekchaga o‘zgartirildi.',
    { reply_markup: getMainMenuKeyboard(session.lang) }
  );
});

// 8. NEET TRIAGE / FIELD AUDIT
bot.hears(['⚡️ NEET Триаж (Подомовой обход)', '/triage'], async (ctx) => {
  await sendNextTriageCard(ctx);
});

bot.callbackQuery('start_triage_btn', async (ctx) => {
  await ctx.answerCallbackQuery();
  await sendNextTriageCard(ctx);
});

async function sendNextTriageCard(ctx: any) {
  const session = getSession(ctx.from.id);
  const queue = db.getTriageQueue(session.mahalla);

  if (queue.length === 0) {
    const text = session.lang === 'uz'
      ? `🎉 <b>«${session.mahalla}» маҳалласида барча NEET номзодлари текшириб чиқилган!</b>\n\nТасдиқлашни кутаётган янги фуқаролар ҳозирча йўқ.`
      : `🎉 <b>В махалле «${session.mahalla}» все кандидаты NEET верифицированы!</b>\n\nНет неподтвержденных записей. Все жители охвачены.`;
    return ctx.reply(text, { parse_mode: 'HTML' });
  }

  const idx = (session.currentTriageIndex || 0) % queue.length;
  const youth = queue[idx];

  const kb = new InlineKeyboard()
    .text(session.lang === 'uz' ? '🔴 NEET эканлигини тасдиқлаш' : '🔴 Подтвердить статус NEET', `tr_confirm:${youth.id}`).row()
    .text(session.lang === 'uz' ? '🟢 Ишга жойлашди (Банд)' : '🟢 Трудоустроен (Занят)', `tr_employed:${youth.id}`).row()
    .text(session.lang === 'uz' ? '🎓 Мономарказга йўналтириш' : '🎓 Направить в Моноцентр', `tr_mono:${youth.id}`).row()
    .text(session.lang === 'uz' ? '💰 «Ёшлар дафтари» субсидияси' : '💰 Субсидия «Ёшлар дафтари»', `tr_sub:${youth.id}`).row()
    .text(session.lang === 'uz' ? '⏭ Кейинги номзод' : '⏭ Следующий кандидат', `tr_next`);

  let msg = '';
  if (session.lang === 'uz') {
    msg = `⚡️ <b>Хонадонбай NEET триаж — Назорат варақаси (${idx + 1}/${queue.length})</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 <b>Ф.И.О:</b> ${youth.full_name_demo}\n` +
      `🎂 <b>Ёши:</b> ${youth.age} ёш (${youth.gender})\n` +
      `📍 <b>Маҳалла:</b> ${youth.makhalla}\n` +
      `📞 <b>Телефон:</b> ${youth.phone_demo}\n` +
      `🎓 <b>Маълумоти:</b> ${youth.education} (${youth.specialty || 'Мутахассислик йўқ'})\n` +
      `🛠 <b>Кўникмалар:</b> ${youth.skills.join(', ') || 'Кўрсатилмаган'}\n` +
      `📊 <b>Ҳозирги ҳолати:</b> <code>${youth.employment_status}</code>\n` +
      `📝 <b>Тизим изоҳи:</b> ${youth.notes || 'Хавф гуруҳидаги фуқаро'}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<i>Хонадонни ўрганиб, қарорни белгиланг:</i>`;
  } else {
    msg = `⚡️ <b>Подомовой NEET триаж — Карточка проверки (${idx + 1}/${queue.length})</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 <b>Ф.И.О:</b> ${youth.full_name_demo}\n` +
      `🎂 <b>Возраст:</b> ${youth.age} лет (${youth.gender})\n` +
      `📍 <b>Махалля:</b> ${youth.makhalla}\n` +
      `📞 <b>Телефон:</b> ${youth.phone_demo}\n` +
      `🎓 <b>Образование:</b> ${youth.education} (${youth.specialty || 'Без специальности'})\n` +
      `🛠 <b>Навыки:</b> ${youth.skills.join(', ') || 'Не указаны'}\n` +
      `📊 <b>Текущий статус:</b> <code>${youth.employment_status}</code>\n` +
      `📝 <b>Примечание алгоритма:</b> ${youth.notes || 'Выявлен алгоритмическим скорингом'}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<i>Опросите гражданина на месте и выберите действие:</i>`;
  }

  await ctx.reply(msg, { parse_mode: 'HTML', reply_markup: kb });
}

// CALLBACK ACTIONS FOR TRIAGE
bot.callbackQuery(/^tr_confirm:(.+)$/, async (ctx) => {
  const youthId = ctx.match[1];
  const session = getSession(ctx.from.id);
  const officer = `Лидер молодёжи (${ctx.from.first_name || 'Инспектор'})`;

  const updated = db.verifyNeetTriage(youthId, 'verified', officer, 'безработный', 'Статус NEET подтвержден лидером махалли в ходе подомового обхода.');
  if (!updated) return ctx.answerCallbackQuery({ text: 'Хатолик / Ошибка' });

  notifyRealtime(
    'TRIAGE_VERIFIED',
    `Лидер махалли "${session.mahalla}" подтвердил статус NEET для: ${updated.full_name_demo}`,
    `"${session.mahalla}" етакчиси фуқаро ${updated.full_name_demo} учун NEET ҳолатини тасдиқлади`,
    session.mahalla,
    officer,
    updated
  );

  await ctx.answerCallbackQuery({ text: '✅ Статус NEET подтвержден!' });
  await ctx.editMessageText(
    session.lang === 'uz'
      ? `✅ <b>${updated.full_name_demo}</b> учун NEET мақоми тасдиқланди ва «Ёшлар дафтари»га киритиш учун юборилди.\n⚡️ <i>Ҳокимият мониторида маълумот янгиланди!</i>`
      : `✅ Статус NEET для <b>${updated.full_name_demo}</b> подтвержден и передан в систему «Ёшлар дафтари».\n⚡️ <i>Данные обновлены на мониторе Хокимията в реальном времени!</i>`,
    { parse_mode: 'HTML' }
  );

  session.currentTriageIndex = (session.currentTriageIndex || 0) + 1;
  setTimeout(() => sendNextTriageCard(ctx), 1000);
});

bot.callbackQuery(/^tr_employed:(.+)$/, async (ctx) => {
  const youthId = ctx.match[1];
  const session = getSession(ctx.from.id);
  const officer = `Лидер молодёжи (${ctx.from.first_name || 'Инспектор'})`;

  const updated = db.updateYouthStatus(youthId, 'занят', officer, 'Трудоустроен по результатам подомового обхода');
  if (!updated) return ctx.answerCallbackQuery({ text: 'Ошибка' });

  notifyRealtime(
    'STATUS_CHANGED',
    `Гражданин ${updated.full_name_demo} (${session.mahalla}) отмечен как трудоустроенный!`,
    `${updated.full_name_demo} (${session.mahalla}) иш билан банд деб белгиланди!`,
    session.mahalla,
    officer,
    updated
  );

  await ctx.answerCallbackQuery({ text: '💼 Занятость зафиксирована!' });
  await ctx.editMessageText(
    session.lang === 'uz'
      ? `💼 <b>${updated.full_name_demo}</b> банд деб белгиланди ва NEET рўйхатидан чиқарилди.\n⚡️ <i>Картадаги бандлик кўрсаткичи ошди!</i>`
      : `💼 <b>${updated.full_name_demo}</b> отмечен как трудоустроенный и снят с учета NEET.\n⚡️ <i>Показатели на карте Хокимията обновлены!</i>`,
    { parse_mode: 'HTML' }
  );

  session.currentTriageIndex = (session.currentTriageIndex || 0) + 1;
  setTimeout(() => sendNextTriageCard(ctx), 1000);
});

bot.callbackQuery(/^tr_mono:(.+)$/, async (ctx) => {
  const youthId = ctx.match[1];
  const session = getSession(ctx.from.id);
  const officer = `Лидер молодёжи (${ctx.from.first_name || 'Инспектор'})`;

  const program: SupportProgram = {
    id: 'prog_ishga_marhamat_tech',
    title: 'Моноцентр «Ишга Мархамат» — Технические специальности',
    titleUz: '«Ishga marhamat» monomarkazi — Texnik mutaxassisliklar',
    category: 'обучение',
    provider: 'Министерство занятости и сокращения бедности РУз',
    description: 'Интенсивное бесплатное 3-месячное обучение профессиям с выдачей сертификата WorldSkills.',
    iconName: 'Wrench'
  };

  const updated = db.assignProgram(youthId, program, officer);
  if (!updated) return ctx.answerCallbackQuery({ text: 'Ошибка' });

  notifyRealtime(
    'PROGRAM_ASSIGNED',
    `${updated.full_name_demo} (${session.mahalla}) направлен в Моноцентр «Ишга Мархамат»!`,
    `${updated.full_name_demo} (${session.mahalla}) «Ишга марҳамат» мономарказига йўналтирилди!`,
    session.mahalla,
    officer,
    updated
  );

  await ctx.answerCallbackQuery({ text: '🎓 Направлен в Моноцентр!' });
  await ctx.editMessageText(
    session.lang === 'uz'
      ? `🎓 <b>${updated.full_name_demo}</b> «Ишга марҳамат» мономарказига йўналтирилди (стипендия: 1 200 000 сўм/ой).\n⚡️ <i>Ҳокимият дашбордида дастур бириктирилди!</i>`
      : `🎓 <b>${updated.full_name_demo}</b> успешно направлен в Моноцентр «Ишга Мархамат» (со стипендией 1.2 млн сум/мес).\n⚡️ <i>Программа зафиксирована в ситуационном центре!</i>`,
    { parse_mode: 'HTML' }
  );

  session.currentTriageIndex = (session.currentTriageIndex || 0) + 1;
  setTimeout(() => sendNextTriageCard(ctx), 1000);
});

bot.callbackQuery(/^tr_sub:(.+)$/, async (ctx) => {
  const youthId = ctx.match[1];
  const session = getSession(ctx.from.id);
  const officer = `Лидер молодёжи (${ctx.from.first_name || 'Инспектор'})`;

  const program: SupportProgram = {
    id: 'prog_yoshlar_daftari_grant',
    title: '«Ёшлар Дафтари» — Безвозмездная субсидия на оборудование',
    titleUz: '«Yoshlar daftari» — Uskunalar xaridi uchun subsidiya',
    category: 'субсидия',
    provider: 'Агентство по делам молодёжи РУз',
    description: 'Выделение субсидии до 10 млн сумов на покупку оборудования или рабочих инструментов.',
    iconName: 'Gift'
  };

  const updated = db.assignProgram(youthId, program, officer);
  if (!updated) return ctx.answerCallbackQuery({ text: 'Ошибка' });

  notifyRealtime(
    'PROGRAM_ASSIGNED',
    `${updated.full_name_demo} (${session.mahalla}) получил рекомендацию на субсидию «Ёшлар Дафтари»!`,
    `${updated.full_name_demo} (${session.mahalla}) «Ёшлар дафтари» субсидиясига тавсия этилди!`,
    session.mahalla,
    officer,
    updated
  );

  await ctx.answerCallbackQuery({ text: '💰 Субсидия одобрена!' });
  await ctx.editMessageText(
    session.lang === 'uz'
      ? `💰 <b>${updated.full_name_demo}</b> «Ёшлар Дафтари» бўйича 10 млн сўмлик субсидияга тавсия этилди.\n⚡️ <i>Ситуацион марказга хабар юборилди!</i>`
      : `💰 <b>${updated.full_name_demo}</b> рекомендован на субсидию «Ёшлар Дафтари» (до 10 млн сум на оборудование).\n⚡️ <i>Событие отображено в реальном времени!</i>`,
    { parse_mode: 'HTML' }
  );

  session.currentTriageIndex = (session.currentTriageIndex || 0) + 1;
  setTimeout(() => sendNextTriageCard(ctx), 1000);
});

bot.callbackQuery('tr_next', async (ctx) => {
  const session = getSession(ctx.from.id);
  session.currentTriageIndex = (session.currentTriageIndex || 0) + 1;
  await ctx.answerCallbackQuery();
  await sendNextTriageCard(ctx);
});

// 9. QUICK YOUTH REGISTRATION WIZARD
bot.hears(['➕ Добавить гражданина', '➕ Янги ёшни қўшиш', '/add'], async (ctx) => {
  const session = getSession(ctx.from!.id);
  session.wizardState = 'awaiting_name';
  session.newYouthDraft = {
    makhalla: session.mahalla,
    neet_verified_by: `Лидер молодёжи (${ctx.from?.first_name || 'Инспектор'})`
  };

  const cancelKb = new Keyboard()
    .text(session.lang === 'uz' ? '❌ Бекор қилиш' : '❌ Отмена')
    .resized();

  const text = session.lang === 'uz'
    ? `📝 <b>Янги фуқарони рўйхатга олиш (1/4 қадам)</b>\n━━━━━━━━━━━━━━━━━━━━\nФуқаронинг <b>Ф.И.О (Исм-шарифи)</b>ни киритинг:\n<i>Мисол: Салимов Отабек Шуҳратович</i>`
    : `📝 <b>Регистрация нового гражданина (Шаг 1 из 4)</b>\n━━━━━━━━━━━━━━━━━━━━\nВведите <b>Ф.И.О гражданина</b>:\n<i>Пример: Салимов Отабек Шухратович</i>`;

  await ctx.reply(text, { parse_mode: 'HTML', reply_markup: cancelKb });
});

bot.hears(['❌ Бекор қилиш', '❌ Отмена'], async (ctx) => {
  const session = getSession(ctx.from!.id);
  session.wizardState = undefined;
  session.newYouthDraft = undefined;

  await ctx.reply(
    session.lang === 'uz' ? 'Амал бекор қилинди.' : 'Регистрация отменена.',
    { reply_markup: getMainMenuKeyboard(session.lang) }
  );
});

bot.on('message:text', async (ctx, next) => {
  const session = getSession(ctx.from.id);
  if (!session.wizardState) return next();

  const text = ctx.message.text.trim();

  if (session.wizardState === 'awaiting_name') {
    session.newYouthDraft!.full_name_demo = text;
    session.wizardState = 'awaiting_age';
    return ctx.reply(
      session.lang === 'uz'
        ? `✅ Ф.И.О: <b>${text}</b>\n\n2/4 қадам: Фуқаронинг <b>ёшини</b> киритинг (18 дан 30 гача):`
        : `✅ ФИО: <b>${text}</b>\n\nШаг 2 из 4: Введите <b>возраст</b> (от 18 до 30 лет):`,
      { parse_mode: 'HTML' }
    );
  }

  if (session.wizardState === 'awaiting_age') {
    const age = parseInt(text, 10);
    if (isNaN(age) || age < 16 || age > 40) {
      return ctx.reply(
        session.lang === 'uz'
          ? 'Илтимос, ёшни тўғри сон шаклида киритинг (масалан: 22):'
          : 'Пожалуйста, введите корректный возраст числом (например: 22):'
      );
    }
    session.newYouthDraft!.age = age;
    session.wizardState = 'awaiting_phone';
    return ctx.reply(
      session.lang === 'uz'
        ? `✅ Ёши: <b>${age}</b>\n\n3/4 қадам: <b>Телефон рақамини</b> киритинг:\n<i>Мисол: +998 (90) 123-45-67</i>`
        : `✅ Возраст: <b>${age}</b>\n\nШаг 3 из 4: Введите <b>номер телефона</b>:\n<i>Пример: +998 (90) 123-45-67</i>`,
      { parse_mode: 'HTML' }
    );
  }

  if (session.wizardState === 'awaiting_phone') {
    session.newYouthDraft!.phone_demo = text;
    session.wizardState = 'awaiting_status';

    const statusKb = new InlineKeyboard()
      .text(session.lang === 'uz' ? '🔴 Ишсиз / NEET' : '🔴 Безработный / NEET', 'wiz_st:безработный').row()
      .text(session.lang === 'uz' ? '🟢 Расмий банд' : '🟢 Трудоустроен / Занят', 'wiz_st:занят').row()
      .text(session.lang === 'uz' ? '🔵 Талаба / Ўқувчи' : '🔵 Обучается (студент)', 'wiz_st:обучается').row()
      .text(session.lang === 'uz' ? '🟡 Тадбиркор' : '🟡 Предприниматель / Самозанятый', 'wiz_st:предприниматель');

    return ctx.reply(
      session.lang === 'uz'
        ? `✅ Телефон: <b>${text}</b>\n\n4/4 қадам: Фуқаронинг <b>бандлик ҳолатини</b> танланг:`
        : `✅ Телефон: <b>${text}</b>\n\nШаг 4 из 4: Выберите <b>текущий статус занятости</b>:`,
      { parse_mode: 'HTML', reply_markup: statusKb }
    );
  }
});

bot.callbackQuery(/^wiz_st:(.+)$/, async (ctx) => {
  const status = ctx.match[1] as EmploymentStatus;
  const session = getSession(ctx.from.id);
  if (!session.newYouthDraft) return ctx.answerCallbackQuery();

  const isNeet = status === 'безработный';
  session.newYouthDraft.employment_status = status;
  session.newYouthDraft.is_neet = isNeet;
  session.newYouthDraft.neet_verification = 'verified';
  session.newYouthDraft.education = (session.newYouthDraft.age || 20) > 22 ? 'Высшее' : 'Средне-специальное';
  session.newYouthDraft.activity_type = isNeet ? 'Поиск работы (NEET)' : 'Активная занятость';
  session.newYouthDraft.gender = 'Мужской';
  session.newYouthDraft.skills = ['Компьютерная грамотность', 'Сервис'];

  const created = db.createYouth(session.newYouthDraft);
  session.wizardState = undefined;
  session.newYouthDraft = undefined;

  notifyRealtime(
    'NEW_YOUTH',
    `Лидер махалли зарегистрировал нового жителя: ${created.full_name_demo} (${session.mahalla}) — Статус: ${status}`,
    `«${session.mahalla}» етакчиси янги фуқарони рўйхатга олди: ${created.full_name_demo} — Ҳолати: ${status}`,
    session.mahalla,
    `Лидер молодёжи (${ctx.from.first_name || 'Инспектор'})`,
    created
  );

  await ctx.answerCallbackQuery({ text: '🎉 Гражданин зарегистрирован!' });
  await ctx.editMessageText(
    session.lang === 'uz'
      ? `🎉 <b>Фуқаро муваффақиятли базага киритилди!</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 <b>Ф.И.О:</b> ${created.full_name_demo}\n📍 <b>Маҳалла:</b> ${created.makhalla}\n📊 <b>Ҳолати:</b> ${created.employment_status}\n🆔 <b>ID рақами:</b> <code>${created.id}</code>\n━━━━━━━━━━━━━━━━━━━━\n⚡️ <i>Маълумот реал вақтда Ҳокимият дашбордида пайдо бўлди!</i>`
      : `🎉 <b>Гражданин успешно зарегистрирован в реестре!</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 <b>Ф.И.О:</b> ${created.full_name_demo}\n📍 <b>Махалля:</b> ${created.makhalla}\n📊 <b>Статус:</b> ${created.employment_status}\n🆔 <b>ID в реестре:</b> <code>${created.id}</code>\n━━━━━━━━━━━━━━━━━━━━\n⚡️ <i>Запись мгновенно отображена в дашборде Хокимията!</i>`,
    { parse_mode: 'HTML' }
  );

  await ctx.reply(
    session.lang === 'uz' ? 'Кейинги амални танланг:' : 'Выберите следующее действие в меню:',
    { reply_markup: getMainMenuKeyboard(session.lang) }
  );
});

// Error handling
bot.catch((err) => {
  console.error('Telegram Bot Error:', err);
});
