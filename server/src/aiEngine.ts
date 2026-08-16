import { db } from './db.js';
import { YouthProfile, SupportProgram, EmploymentStatus } from './types.js';

export interface AiResponse {
  text: string;
  action?: {
    type: 'HIGHLIGHT_MAHALLAS' | 'NAVIGATE_TAB' | 'OPEN_YOUTH' | 'FILTER_MAHALLA';
    mahallas?: string[];
    tab?: string;
    youthId?: string;
    mahalla?: string;
  };
}

export function processAiQuery(rawQuery: string, lang: 'ru' | 'uz' = 'ru'): AiResponse {
  const query = (rawQuery || '').trim();
  const qLower = query.toLowerCase();

  const allYouth = db.getAllYouth();
  const stats = db.getStats();

  // Helper dictionary of known mahallas
  const MAHALLAS = [
    'Буюк Ипак Йўли', 'Олий Ҳиммат', 'Шаҳриобод', 'Авайхон',
    'Дархон', 'Феруза', 'Қорасув', 'Ҳумо'
  ];

  // Check if a specific mahalla is mentioned
  const mentionedMahalla = MAHALLAS.find(m => {
    const clean = m.toLowerCase().replace(/['`ʻʼ]/g, '');
    const cleanQ = qLower.replace(/['`ʻʼ]/g, '');
    const parts = clean.split(' ');
    return cleanQ.includes(clean) || parts.some(p => p.length > 3 && cleanQ.includes(p));
  });

  // 1. CITIZEN SEARCH (BY NAME, PINFL, ID, SKILL)
  const isSearchIntent = qLower.includes('найди') || qLower.includes('кто так') || qLower.includes('профиль') ||
    qLower.includes('покажи') || qLower.includes('топ') || qLower.includes('излаш') || qLower.includes('топиш') ||
    qLower.includes('ким') || qLower.includes('y_0') || qLower.includes('малака');

  if (isSearchIntent) {
    // Check if searching for a specific youth by name or ID
    const matchingYouth = allYouth.filter(y => {
      const nameParts = y.full_name_demo.toLowerCase().split(' ');
      const idMatch = qLower.includes(y.id.toLowerCase());
      const nameMatch = nameParts.some(np => np.length > 2 && qLower.includes(np));
      const skillMatch = y.skills.some(s => qLower.includes(s.toLowerCase())) ||
        (y.specialty && qLower.includes(y.specialty.toLowerCase()));
      return idMatch || nameMatch || skillMatch;
    });

    if (matchingYouth.length > 0) {
      const topMatch = matchingYouth[0];
      const count = matchingYouth.length;

      if (lang === 'uz') {
        let text = `<b>ТИЗИМДАН ФУҚАРОЛАР БЎЙИЧА ТОПИЛГАН МАЪЛУМОТ</b>\n` +
          `Қидирув натижасида <b>${count}</b> нафар ёшлар топилди.\n\n` +
          `<b>Асосий топилган профиль:</b>\n` +
          `• <b>Ф.И.О:</b> ${topMatch.full_name_demo}\n` +
          `• <b>ID:</b> <code>${topMatch.id}</code> | <b>Ёши:</b> ${topMatch.age} ёш (${topMatch.gender})\n` +
          `• <b>Маҳалла:</b> ${topMatch.makhalla}\n` +
          `• <b>Ҳолати:</b> ${topMatch.employment_status.toUpperCase()}\n` +
          `• <b>Мутахассислиги:</b> ${topMatch.specialty || 'Кўрсатилмаган'}\n` +
          `• <b>Кўникмалари:</b> ${topMatch.skills.join(', ')}\n` +
          `• <b>NEET хавф ҳолати:</b> ${topMatch.is_neet ? 'Хавф гуруҳида (Текширув талаб этилади)' : 'Барқарор'}\n`;

        if (count > 1) {
          text += `\n<b>Шунингдек бошқа натижалар:</b>\n` +
            matchingYouth.slice(1, 4).map(y => `• <b>${y.full_name_demo}</b> (${y.makhalla}) — ${y.employment_status}`).join('\n');
        }

        return {
          text,
          action: {
            type: 'OPEN_YOUTH',
            youthId: topMatch.id,
            tab: 'registry'
          }
        };
      } else {
        let text = `<b>РЕЗУЛЬТАТЫ ПОИСКА ПО БАЗЕ ДАННЫХ</b>\n` +
          `По вашему запросу найдено граждан: <b>${count}</b> чел.\n\n` +
          `<b>Основной найденный профиль:</b>\n` +
          `• <b>Ф.И.О:</b> ${topMatch.full_name_demo}\n` +
          `• <b>ID в реестре:</b> <code>${topMatch.id}</code> | <b>Возраст:</b> ${topMatch.age} лет (${topMatch.gender})\n` +
          `• <b>Махалля:</b> ${topMatch.makhalla}\n` +
          `• <b>Текущий статус:</b> ${topMatch.employment_status.toUpperCase()}\n` +
          `• <b>Специальность:</b> ${topMatch.specialty || 'Не указана'}\n` +
          `• <b>Навыки и компетенции:</b> ${topMatch.skills.join(', ')}\n` +
          `• <b>Статус NEET:</b> ${topMatch.is_neet ? 'В группе риска (Требует проверки)' : 'Подтверждённая занятость'}\n`;

        if (count > 1) {
          text += `\n<b>Другие совпадения в выборке:</b>\n` +
            matchingYouth.slice(1, 4).map(y => `• <b>${y.full_name_demo}</b> (${y.makhalla}) — ${y.employment_status}`).join('\n');
        }

        return {
          text,
          action: {
            type: 'OPEN_YOUTH',
            youthId: topMatch.id,
            tab: 'registry'
          }
        };
      }
    }
  }

  // 2. SPECIFIC MAHALLA DEEP DIVE
  if (mentionedMahalla) {
    const mahallaYouth = allYouth.filter(y => y.makhalla === mentionedMahalla);
    const mTotal = mahallaYouth.length;
    const mNeet = mahallaYouth.filter(y => y.is_neet).length;
    const mEmployed = mahallaYouth.filter(y => y.employment_status === 'занят' || y.employment_status === 'предприниматель').length;
    const mStudying = mahallaYouth.filter(y => y.employment_status === 'обучается').length;
    const mUnemployed = mahallaYouth.filter(y => y.employment_status === 'безработный').length;
    const mRate = mTotal > 0 ? Math.round(((mEmployed + mStudying) / mTotal) * 100) : 0;

    if (lang === 'uz') {
      const text = `<b>«${mentionedMahalla.toUpperCase()}» МАҲАЛЛАСИ БЎЙИЧА ПАСПОРТ ВА ТАҲЛИЛ</b>\n\n` +
        `<b>Аҳоли ва мониторинг:</b>\n` +
        `• Рўйхатга олинган ёшлар (18–30 ёш): <b>${mTotal} нафар</b>\n` +
        `• Расмий бандлик ва таълим даражаси: <b>${mRate}%</b>\n` +
        `• Иш билан таъминланганлар: <b>${mEmployed} нафар</b>\n` +
        `• Талабалар ва ўқувчилар: <b>${mStudying} нафар</b>\n` +
        `• Ишсизлар ва изловчилар: <b>${mUnemployed} нафар</b>\n` +
        `• NEET хавф гуруҳидаги номзодлар: <b>${mNeet} нафар</b>\n\n` +
        `<b>Манзилли тавсия:</b>\n` +
        (mNeet > 3
          ? `Ушбу маҳаллада NEET хавфи юқори. Ёшлар етакчиси хонадонбай обход орқали сўровнома ўтказиши ва Мономарказнинг касбий таълим квоталарини йўналтириши тавсия этилади.`
          : `Маҳаллада бандлик кўрсаткичлари барқарор. Профилактик мониторинг ва стартап лойиҳаларни қўллаб-қувватлаш давом эттирилсин.`);

      return {
        text,
        action: {
          type: 'HIGHLIGHT_MAHALLAS',
          mahallas: [mentionedMahalla],
          mahalla: mentionedMahalla
        }
      };
    } else {
      const text = `<b>ПАСПОРТ И АНАЛИТИКА МАХАЛЛИ «${mentionedMahalla.toUpperCase()}»</b>\n\n` +
        `<b>Демография и занятость:</b>\n` +
        `• Состоит на учёте (18–30 лет): <b>${mTotal} чел.</b>\n` +
        `• Совокупный уровень занятости: <b>${mRate}%</b>\n` +
        `• Занятые (найм / бизнес): <b>${mEmployed} чел.</b>\n` +
        `• Студенты вузов и колледжей: <b>${mStudying} чел.</b>\n` +
        `• Безработные граждане: <b>${mUnemployed} чел.</b>\n` +
        `• Группа риска NEET: <b>${mNeet} чел.</b>\n\n` +
        `<b>Управленческая рекомендация:</b>\n` +
        (mNeet > 3
          ? `В махалле зафиксирована повышенная концентрация NEET. Лидеру молодёжи рекомендовано завершить верификацию через Telegram-бот и подать заявку на квоты переподготовки в Моноцентр «Ишга Мархамат».`
          : `Показатели махалли находятся в пределах нормы. Рекомендовано поддерживать мониторинг самозанятых.`);

      return {
        text,
        action: {
          type: 'HIGHLIGHT_MAHALLAS',
          mahallas: [mentionedMahalla],
          mahalla: mentionedMahalla
        }
      };
    }
  }

  // 3. BUDGET / GRANTS / SUBSIDY QUOTA ALLOCATION
  const isBudgetIntent = qLower.includes('бюджет') || qLower.includes('субсид') || qLower.includes('квот') ||
    qLower.includes('деньг') || qLower.includes('грант') || qLower.includes('сумм') ||
    qLower.includes('маблағ') || qLower.includes('subsidiya') || qLower.includes('kvota');

  if (isBudgetIntent) {
    if (lang === 'uz') {
      return {
        text: `<b>«ЁШЛАР ДАФТАРИ» СУБСИДИЯ ВА КВОТАЛАР ТАҚСИМОТИ</b>\n\n` +
          `Туман бўйича ${stats.neet} нафар NEET хавф гуруҳидаги ёшлар учун тавсия этилган лимитлар:\n\n` +
          `• <b>Мономарказ «Ишга Марҳамат» (касбий таълим):</b> 45 та ўрин (Бандлик жамғармаси ҳисобидан 100% қопланади)\n` +
          `• <b>Асбоб-ускуна ва меҳнат қуроллари хариди:</b> 20 та субсидия (25 млн сўмгача БҲМнинг 70 баравари)\n` +
          `• <b>IT-Park таълим грантлари:</b> 15 та квота (дастурлаш, веб-дизайн, 3D-моделлаштириш)\n` +
          `• <b>Ҳайдовчилик гувоҳномаси харажатлари:</b> 10 та квота (Бандликка кўмаклашиш жамғармаси)\n\n` +
          `<b>Хулоса:</b> Бюджетнинг 60% қисмини «Олий Ҳиммат» ва «Буюк Ипак Йўли» маҳаллаларидаги эҳтиёжманд ёшларга йўналтириш юқори самара беради.`,
        action: {
          type: 'NAVIGATE_TAB',
          tab: 'programs'
        }
      };
    } else {
      return {
        text: `<b>РАСПРЕДЕЛЕНИЕ КВОТ СУБСИДИЙ И ГРАНТОВ РАЙОНА</b>\n\n` +
          `На основе реестра из ${stats.neet} кандидатов группы NEET рассчитана оптимальная структура бюджетных мер поддержки:\n\n` +
          `• <b>Моноцентр «Ишга Мархамат» (профпереподготовка):</b> 45 мест (100% покрытие из Фонда занятости)\n` +
          `• <b>Субсидии на покупку орудий труда:</b> 20 квот (до 25 млн сум / до 70 БРВ)\n` +
          `• <b>IT-Park образовательные гранты:</b> 15 квот (Frontend, Python, QA, Графический дизайн)\n` +
          `• <b>Компенсация курсов водительских прав (кат. B/C):</b> 10 квот\n\n` +
          `<b>Рекомендация Хокимияту:</b> Направить 60% квот в очаги с максимальным риском NEET («Олий Ҳиммат» и «Буюк Ипак Йўли») для обеспечения KPI до конца квартала.`,
        action: {
          type: 'NAVIGATE_TAB',
          tab: 'programs'
        }
      };
    }
  }

  // 4. OFFICIAL MEMO / REPORT TO HOKIM (Служебная записка)
  const isReportIntent = qLower.includes('отчет') || qLower.includes('записк') || qLower.includes('хоким') ||
    qLower.includes('доклад') || qLower.includes('справк') || qLower.includes('hisobot') || qLower.includes('hokim');

  if (isReportIntent) {
    if (lang === 'uz') {
      return {
        text: `<b>СЛУЖЕБНАЯ ЗАПИСКА (БИЛДИРИШНОМА)</b>\n` +
          `<b>Кимга:</b> Мирзо Улуғбек тумани Ҳокимига\n` +
          `<b>Кимдан:</b> Ёшлар ишлари ва бандлик бўйича масъул котибият\n` +
          `<b>Мавзу:</b> Туман ёшларининг бандлик ҳолати ва NEET триаж натижалари тўғрисида\n\n` +
          `Ҳурматли Ҳоким!\n\n` +
          `Тумандаги 8 та маҳалла бўйича ўтказилган рақамли мониторинг натижаларига кўра:\n` +
          `1. 18–30 ёшдаги <b>${stats.total}</b> нафар ёшларнинг маълумотлари таҳлил қилинди.\n` +
          `2. Банд бўлганлар ва талабалар улуши: <b>${stats.employed + stats.studying} нафар (${stats.employmentRate}%)</b>.\n` +
          `3. NEET хавф гуруҳида: <b>${stats.neet} нафар</b> ёшлар аниқланди (шундан ${stats.neetPending} нафари хонадонбай верификация жараёнида).\n` +
          `4. Давлат дастурларига бириктирилган: <b>${stats.supported} нафар</b> фуқаро.\n\n` +
          `<b>Таклиф этилаётган чоралар:</b>\n` +
          `• Маҳалла етакчилари томонидан Telegram-бот орқали сўровномаларни якунлаш.\n` +
          `• Касбий қайта тайёрлаш ва субсидиялар бўйича квоталарни тасдиқлаш.`,
        action: {
          type: 'NAVIGATE_TAB',
          tab: 'dashboard'
        }
      };
    } else {
      return {
        text: `<b>СЛУЖЕБНАЯ ЗАПИСКА</b>\n` +
          `<b>Кому:</b> Хокиму Мирзо-Улугбекского района г. Ташкента\n` +
          `<b>От кого:</b> Рабочая группа по мониторингу занятости молодёжи\n` +
          `<b>Тема:</b> Текущий статус занятости молодёжи (18–30 лет) и результаты NEET-триажа\n\n` +
          `Уважаемый Хоким!\n\n` +
          `По состоянию на текущую дату в 8 махаллях Мирзо-Улугбекского района:\n` +
          `1. На цифровом учёте состоят <b>${stats.total}</b> молодых граждан.\n` +
          `2. Суммарный уровень занятости и обучения составляет <b>${stats.employmentRate}%</b> (${stats.employed + stats.studying} чел.).\n` +
          `3. В группу риска NEET выделено <b>${stats.neet}</b> кандидатов (из них ${stats.neetPending} чел. проходят подомовую верификацию Лидерами молодёжи).\n` +
          `4. Мерами господдержки уже охвачено: <b>${stats.supported}</b> чел.\n\n` +
          `<b>Предлагаемые поручения:</b>\n` +
          `• Обязать Центр занятости провести адресную ярмарку вакансий в махалле «Олий Ҳиммат».\n` +
          `• Утвердить распределение квот субсидий фонда «Ёшлар Дафтари».`,
        action: {
          type: 'NAVIGATE_TAB',
          tab: 'dashboard'
        }
      };
    }
  }

  // 5. NEET & RISK FACTORS IN-DEPTH ANALYSIS
  const isNeetIntent = qLower.includes('neet') || qLower.includes('риск') || qLower.includes('триаж') ||
    qLower.includes('безработ') || qLower.includes('фактор') || qLower.includes('хавф') || qLower.includes('ишсиз');

  if (isNeetIntent) {
    const neetList = allYouth.filter(y => y.is_neet);
    const femalesNeet = neetList.filter(y => y.gender === 'Женский').length;
    const malesNeet = neetList.filter(y => y.gender === 'Мужской').length;
    const noHigherEd = neetList.filter(y => y.education !== 'Высшее').length;

    if (lang === 'uz') {
      return {
        text: `<b>NEET ХАВФ ГУРУҲИ ВА СКОРИНГ ТАҲЛИЛИ</b>\n\n` +
          `Туманда жами <b>${stats.neet} нафар</b> фуқаро NEET хавф гуруҳида аниқланган (${stats.neetPending} нафари текширувда).\n\n` +
          `<b>Демографик тақсимот ва хавф омиллари:</b>\n` +
          `• Эркаклар: <b>${malesNeet} нафар</b> | Аёллар: <b>${femalesNeet} нафар</b>\n` +
          `• Олий маълумотга эга бўлмаганлар улуши: <b>${Math.round((noHigherEd / (stats.neet || 1)) * 100)}%</b>\n` +
          `• Асосий сабаблар: Касбий малака етишмаслиги, мавсумий ишлар тўхташи, олий таълимга кира олмаганлик.\n\n` +
          `<b>Тавсия:</b> Лидерлар томонидан Telegram-бот орқали «Подомовой обход» ўтказилиб, ҳар бир номзодга Мономарказ ёки субсидия бириктирилиши зарур.`,
        action: {
          type: 'NAVIGATE_TAB',
          tab: 'triage'
        }
      };
    } else {
      return {
        text: `<b>ГЛУБОКИЙ АНАЛИЗ ГРУППЫ РИСКА NEET И ФАКТОРОВ</b>\n\n` +
          `В районе алгоритмическим скорингом в категорию NEET выделено <b>${stats.neet} чел.</b> (${stats.neetPending} на верификации Лидерами).\n\n` +
          `<b>Демография и ключевые факторы риска:</b>\n` +
          `• Мужчины: <b>${malesNeet} чел.</b> | Женщины: <b>${femalesNeet} чел.</b>\n` +
          `• Доля без высшего образования: <b>${Math.round((noHigherEd / (stats.neet || 1)) * 100)}%</b>\n` +
          `• Ключевые паттерны: Отсутствие официальной квалификации, неактивный статус в ГНК/ЕНСТ более 6 месяцев, прекращение обучения.\n\n` +
          `<b>Управленческое решение:</b> Завершить верификацию через модуль «NEET Триаж» и направить граждан на субсидии и курсы переподготовки.`,
        action: {
          type: 'NAVIGATE_TAB',
          tab: 'triage'
        }
      };
    }
  }

  // 6. LEGISLATION & ON-PREMISE SECURITY (ЗРУ-547, Sovereign AI)
  const isSecurityIntent = qLower.includes('безопасн') || qLower.includes('зру') || qLower.includes('547') ||
    qLower.includes('закон') || qLower.includes('персонал') || qLower.includes('on-premise') ||
    qLower.includes('хавфсиз') || qLower.includes('қонун') || qLower.includes('махфий');

  if (isSecurityIntent) {
    if (lang === 'uz') {
      return {
        text: `<b>АХБОРОТ ХАВФСИЗЛИГИ ВА ЗРУ-547 МУВОФИҚЛИГИ</b>\n\n` +
          `Тизим Ўзбекистон Республикасининг «Шахсга доир маълумотлар тўғрисида»ги <b>ЗРУ-547-сон Қонунига</b> тўлиқ мувофиқ ишлайди:\n\n` +
          `• <b>Локал суверен архитектура (On-Premise):</b> Барча ИИ моделлари ва базалар Хокимиятнинг ёпиқ серверларида ишлайди, ташқи хорижий булутларга маълумот юборилмайди.\n` +
          `• <b>Синтетик ва ниқобланган маълумотлар:</b> Демо-режимда шахсий идентификаторлар (ПИНФЛ, телефон) криптографик усулда ниқобланган.\n` +
          `• <b>Ролли кириш назорати:</b> Лидерлар фақат ўз маҳалласини, Ҳокимият эса умумлаштирилган туман аналитикасини кўради.`,
        action: {
          type: 'NAVIGATE_TAB',
          tab: 'dashboard'
        }
      };
    } else {
      return {
        text: `<b>ИНФОРМАЦИОННАЯ БЕЗОПАСНОСТЬ И СООТВЕТСТВИЕ ЗРУ-547</b>\n\n` +
          `Система спроектирована в строгом соответствии с Законом Республики Узбекистан <b>ЗРУ-547 «О персональных данных»</b>:\n\n` +
          `• <b>Суверенная архитектура (On-Premise):</b> Все вычисления ИИ-советника производятся локально в защищённом контуре Хокимията без передачи данных в зарубежные публичные API.\n` +
          `• <b>Деперсонализация:</b> В демонстрационном режиме все персональные идентификаторы (ПИНФЛ, телефон) обезличены и зашифрованы.\n` +
          `• <b>Разграничение прав доступа (RBAC):</b> Лидер махалли имеет доступ только к жителям своего сектора, районные офицеры — к сводной статистике без избыточных персональных данных.`,
        action: {
          type: 'NAVIGATE_TAB',
          tab: 'dashboard'
        }
      };
    }
  }

  // 7. DEFAULT GOVTECH ADVISORY / GENERAL COPILOT INTENT
  // Calculate top problem mahallas
  const mahallaCounts: Record<string, { total: number; neet: number; unemployed: number }> = {};
  allYouth.forEach(y => {
    if (!mahallaCounts[y.makhalla]) {
      mahallaCounts[y.makhalla] = { total: 0, neet: 0, unemployed: 0 };
    }
    mahallaCounts[y.makhalla].total++;
    if (y.is_neet) mahallaCounts[y.makhalla].neet++;
    if (y.employment_status === 'безработный') mahallaCounts[y.makhalla].unemployed++;
  });

  const sorted = Object.entries(mahallaCounts).sort((a, b) => b[1].neet - a[1].neet);
  const top = sorted.slice(0, 3);

  if (lang === 'uz') {
    return {
      text: `<b>МИРЗО УЛУҒБЕК ТУМАНИ ИИ-МАСЛАҲАТЧИСИ</b>\n\n` +
        `Айни пайтда туманда <b>${stats.total} нафар</b> ёшлар назоратга олинган. Умумий бандлик даражаси: <b>${stats.employmentRate}%</b>.\n\n` +
        `<b>Энг муҳим ҳолатлар:</b>\n` +
        `• NEET хавфи энг юқори маҳаллалар: ${top.map(m => `<b>«${m[0]}»</b> (${m[1].neet} та NEET)`).join(', ')}.\n` +
        `• Верификация кутилаётган фуқаролар: <b>${stats.neetPending} нафар</b>.\n` +
        `• Давлат дастурларига бириктирилган: <b>${stats.supported} нафар</b>.\n\n` +
        `<b>Сиз қуйидаги саволларни беришингиз мумкин:</b>\n` +
        `1. <i>«Маҳаллалар таҳлилини кўрсат»</i>\n` +
        `2. <i>«Ҳокимга расмий билдиришнома тузиб бер»</i>\n` +
        `3. <i>«Ёшлар дафтари субсидия квоталарини тақсимла»</i>\n` +
        `4. <i>«IT соҳасидаги ёшларни топиб бер»</i>`,
      action: {
        type: 'HIGHLIGHT_MAHALLAS',
        mahallas: top.map(m => m[0])
      }
    };
  } else {
    return {
      text: `<b>ИИ-СОВЕТНИК ХОКИМИЯТА МИРЗО-УЛУГБЕКСКОГО РАЙОНА</b>\n\n` +
        `В едином цифровом реестре состоят <b>${stats.total} молодых граждан</b>. Совокупный уровень занятости: <b>${stats.employmentRate}%</b>.\n\n` +
        `<b>Оперативная сводка:</b>\n` +
        `• Очаги повышенного риска NEET: ${top.map(m => `<b>«${m[0]}»</b> (${m[1].neet} кандидатов NEET)`).join(', ')}.\n` +
        `• На подомовой верификации: <b>${stats.neetPending} чел.</b>\n` +
        `• Охвачено мерами господдержки: <b>${stats.supported} чел.</b>\n\n` +
        `<b>Рекомендуемые команды и сценарии:</b>\n` +
        `1. <i>«В каких махаллях самый высокий риск NEET?»</i>\n` +
        `2. <i>«Сформировать служебную записку для хокима»</i>\n` +
        `3. <i>«Распределить квоты фонда Ёшлар Дафтари»</i>\n` +
        `4. <i>«Найти специалистов со знанием 1С или Python»</i>`,
      action: {
        type: 'HIGHLIGHT_MAHALLAS',
        mahallas: top.map(m => m[0])
      }
    };
  }
}
