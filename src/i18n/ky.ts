import { formatAmount } from '../utils/money';
import { kyTime } from './kyGrammar';
import type { Strings } from './ru';

/** Кыргызский словарь. Тип Strings не даёт пропустить ни один ключ из ru.ts. */
export const ky: Strings = {
  languageName: 'Кыргызча',

  common: {
    clinicKind: 'Стоматологиялык клиника',
    back: 'Артка',
    close: 'Жабуу',
    retry: 'Кайра аракет кылуу',
    cancel: 'Жокко чыгаруу',
    save: 'Сактоо',
    continue: 'Улантуу',
    change: 'Өзгөртүү',
    all: 'Баары',
    toHome: 'Башкы бетке',
    book: 'Жазылуу',
    bookVisit: 'Кабыл алууга жазылуу',
    priceFrom: (amount: number) => `${formatAmount(amount)} сомдон`,
    priceOnConsultation: 'Баасы консультациядан кийин',
    duration: (minutes: number) => `≈ ${minutes} мүн`,
    loading: 'Жүктөлүүдө',
    loadErrorTitle: 'Жүктөө мүмкүн болгон жок',
    loadErrorText: 'Интернетти текшерип, кайра аракет кылыңыз.',
    couldNotOpen: (value: string) => `Тиркемени ачуу мүмкүн болгон жок. Клиниканын байланышы: ${value}`,
    couldNotOpenLink: 'Шилтемени ачуу мүмкүн болгон жок. Кайра аракет кылыңыз.',
  },

  languages: {
    ky: 'Кыргызча',
    ru: 'Русский',
    speaks: (langs) => {
      const hasKy = langs.includes('ky');
      const hasRu = langs.includes('ru');
      if (hasKy && hasRu) return 'Кыргыз жана орус тилдеринде';
      return hasKy ? 'Кыргыз тилинде' : 'Орус тилинде';
    },
  },

  dates: {
    today: 'Бүгүн',
    tomorrow: 'Эртең',
    months: [
      'январь',
      'февраль',
      'март',
      'апрель',
      'май',
      'июнь',
      'июль',
      'август',
      'сентябрь',
      'октябрь',
      'ноябрь',
      'декабрь',
    ],
    weekdays: {
      mon: 'дүйшөмбү',
      tue: 'шейшемби',
      wed: 'шаршемби',
      thu: 'бейшемби',
      fri: 'жума',
      sat: 'ишемби',
      sun: 'жекшемби',
    },
    weekdaysShort: { mon: 'Дш', tue: 'Шш', wed: 'Шр', thu: 'Бш', fri: 'Жм', sat: 'Иш', sun: 'Жк' },
    onWeekday: {
      mon: 'дүйшөмбү күнү',
      tue: 'шейшемби күнү',
      wed: 'шаршемби күнү',
      thu: 'бейшемби күнү',
      fri: 'жума күнү',
      sat: 'ишемби күнү',
      sun: 'жекшемби күнү',
    },
    long: (day: number, month: string) => `${day}-${month}`,
    withWeekday: (date: string, weekday: string) => `${date}, ${weekday}`,
    relative: (relative: string, date: string) => `${relative}, ${date}`,
    dateTime: (date: string, time: string) => `${date}, саат ${time}`,
    relativeTime: (relative: string, time: string) => `${relative}, саат ${time}`,
    range: (start: string, end: string) => `${start}–${end}`,
  },

  a11y: {
    openMenu: 'Менюну ачуу',
    closeMenu: 'Менюну жабуу',
    back: 'Артка',
    callClinic: 'Клиникага чалуу',
    whatsappClinic: 'WhatsApp аркылуу жазуу',
    telegramClinic: 'Telegram аркылуу жазуу',
    emailClinic: 'Электрондук почтага жазуу',
    addressClinic: 'Клиниканын дарегин картадан ачуу',
    logo: 'SmileLab',
    stepProgress: (step: number, total: number) => `Кадам ${step} / ${total}`,
    day: (label, state) =>
      state === 'available'
        ? `${label}, бош убакыт бар`
        : state === 'workday'
          ? `${label}, иш күнү`
          : state === 'full'
            ? `${label}, орун жок`
            : state === 'passed'
              ? `${label}, бул күнгө жазылуу убактысы өтүп кетти`
              : `${label}, клиника иштебейт`,
    slot: (time: string) => `Убакыт ${time}`,
    upcomingDot: 'алдыда жазылуу бар',
    dismissToast: 'Билдирүүнү жашыруу',
  },

  tabs: {
    home: 'Башкы бет',
    services: 'Кызматтар',
    appointments: 'Жазылуулар',
    profile: 'Профиль',
  },

  menu: {
    home: 'Башкы бет',
    services: 'Кызматтар жана баалар',
    appointments: 'Менин жазылууларым',
    about: 'Клиника жөнүндө',
    contacts: 'Байланыш',
    profile: 'Профиль',
    language: 'Тил',
  },

  onboarding: {
    title: 'Тилди тандаңыз · Выберите язык',
  },

  home: {
    quickCall: 'Чалуу',
    quickWhatsApp: 'WhatsApp',
    quickTelegram: 'Telegram',
    quickAddress: 'Дарек',
    status: {
      openUntil: (time: string) => `Бүгүн ${kyTime(time, 'dat')} чейин ачыкпыз`,
      breakUntil: (time: string) => `Азыр тыныгуу · ${kyTime(time, 'dat')} чейин`,
      opensToday: (time: string) => `Азыр жабык · бүгүн саат\u00A0${kyTime(time, 'loc')} ачылабыз`,
      opensTomorrow: (time: string) => `Азыр жабык · эртең саат\u00A0${kyTime(time, 'loc')} ачылабыз`,
      opensOn: (onWeekday: string, time: string) =>
        `Азыр жабык · ${onWeekday} саат\u00A0${kyTime(time, 'loc')} ачылабыз`,
      unknown: 'Иштөө убактысын администратордон тактаңыз',
    },
    nextAppointment: 'Жакынкы жазылуу',
    servicesTitle: 'Кызматтар жана баалар',
    servicesAll: 'Бардык кызматтар',
    doctorsTitle: 'Дарыгерлер',
    promoMore: 'Кененирээк',
    startTitle: 'Эмнеден баштоону билбей жатасызбы?',
    startText: 'Консультацияга жазылыңыз: дарыгер карап чыгып, дарылоонун жолдорун түшүндүрөт жана так баасын айтат.',
    startConsult: 'Консультацияга жазылуу',
    startAsk: 'Суроо берүү',
    askMessage: 'Саламатсызбы! Менин бир суроом бар.',
  },

  services: {
    title: 'Кызматтар жана баалар',
    subtitle: 'Баштапкы баалар көрсөтүлгөн. Так баасын дарыгер карап чыккандан кийин айтат.',
    emptyTitle: 'Кызматтардын тизмеси жакында чыгат',
    emptyText: 'Бизге чалыңыз же жазыңыз — баалар тууралуу айтып, ыңгайлуу убакытка жазып коёбуз.',
  },

  service: {
    price: 'Баасы',
    duration: 'Узактыгы',
    about: 'Процедура жөнүндө',
    included: 'Эмнелер кирет',
    process: 'Дарылоо кандай өтөт',
    implantWords: ['Жаңы', 'тиш'],
    processCount: (n: number) => `${n} этап`,
    expectations: 'Эмнени күтүү керек',
    faq: 'Көп берилүүчү суроолор',
    doctors: 'Дарыгерлер',
    book: 'Жазылуу',
    ask: 'Суроо',
    askA11y: (channel: string) => `${channel} аркылуу суроо берүү`,
    askMessage: (service: string) => `Саламатсызбы! «${service}» кызматы тууралуу кененирээк билгим келет.`,
    notFoundTitle: 'Кызмат табылган жок',
    notFoundText: 'Балким, ал тизмеден алынып салынгандыр. Бардык кызматтарды караңыз.',
  },

  doctor: {
    languages: 'Кабыл алуу тилдери',
    days: 'Кабыл алуу күндөрү',
    services: 'Кызматтар',
    book: 'Дарыгерге жазылуу',
    dayOff: 'дем алыш',
    notFoundTitle: 'Дарыгер табылган жок',
    notFoundText: 'Дарыгерлердин тизмесин клиника жөнүндө барактан караңыз.',
  },

  booking: {
    serviceTitle: 'Кандай кызмат керек?',
    serviceHint: 'Так билбесеңиз — консультацияны тандаңыз.',
    datetimeTitle: 'Күндү жана убакытты тандаңыз',
    rescheduleTitle: 'Жазылууну жылдыруу',
    rescheduleCurrent: (label: string) => `Азыркы убакыт: ${label}`,
    anyDoctor: 'Каалаган дарыгер',
    anyFreeDoctor: 'Бош болгон каалаган дарыгер',
    morning: 'Эртең менен',
    afternoon: 'Күндүз',
    evening: 'Кечкурун',
    noSlotsDay: 'Бул күнү бош убакыт жок.',
    noTimeLeft: 'Бул күнгө жазылуу убактысы өтүп кетти.',
    slotsFree: 'Бош убакыт',
    slotsWanted: 'Кааланган убакыт',
    wantedNote: (channel: string) => `Администратор убакытты ырастайт же ${channel} аркылуу башка убакыт сунуштайт.`,
    doctorOptional: 'Дарыгер — мүмкүнчүлүккө жараша',
    nearestWorkday: (label: string) => `Эң жакынкы иш күнү — ${label}`,
    noWorkingHours: 'Иштөө убактысы азырынча көрсөтүлгөн эмес. Чалыңыз — ыңгайлуу убакыт таап беребиз.',
    dayClosed: 'Бул күнү клиника иштебейт.',
    nearest: (label: string) => `Эң жакынкы бош убакыт — ${label}`,
    show: 'Көрсөтүү',
    noSlotsAtAll: 'Жакынкы жумаларда бош убакыт жок. Чалыңыз — ыңгайлуу убакыт таап беребиз.',
    noWantedTime: 'Жакынкы жумаларга тиркеме аркылуу жазылуу мүмкүн эмес. Чалыңыз — ыңгайлуу убакыт таап беребиз.',
    call: 'Чалуу',
    selectTime: 'Убакытты тандаңыз',
    rescheduleTo: (label: string) => `Жылдыруу: ${label}`,
    detailsTitle: 'Текшерип, ырастаңыз',
    summaryService: 'Кызмат',
    summaryWhen: 'Күнү жана убактысы',
    summaryWanted: 'Кааланган убакыт',
    summaryDoctor: 'Дарыгер',
    nameLabel: 'Атыңыз',
    namePlaceholder: 'Сизге кантип кайрылалы',
    phoneLabel: 'Телефон',
    commentLabel: 'Эмне тынчсыздандырат?',
    commentPlaceholder: 'Мисалы: сол жактагы тиш ооруйт',
    commentHint: 'Кыскача, мисалы: тиш ооруйт, консультация керек',
    optional: 'милдеттүү эмес',
    paymentLine: 'Төлөм кабыл алуудан кийин клиникада: накталай, карта же банктын тиркемеси аркылуу QR.',
    consentPrefix: 'Баскычты басуу менен сиз ',
    consentLink: 'купуялык саясатына',
    consentSuffix: ' макул болосуз.',
    submitWhatsApp: 'Арызды WhatsApp аркылуу жөнөтүү',
    submitTelegram: 'Арызды Telegram аркылуу жөнөтүү',
    submit: 'Жазылуу',
    errors: {
      nameEmpty: 'Атыңызды жазыңыз',
      nameShort: 'Аты өтө кыска',
      phoneEmpty: 'Телефон номериңизди жазыңыз',
      phoneIncomplete: '+996дан кийин 9 сан болушу керек',
      phoneInvalidPrefix: '+996дан кийинки номер 0 же 1 менен башталбашы керек',
      emailInvalid: 'Электрондук почтанын дарегин текшериңиз',
    },
    slotTaken: 'Бул убакыт жаңы эле ээленип калды. Башка убакытты тандаңыз.',
    submitError: 'Арызды жөнөтүү мүмкүн болгон жок. Кайра аракет кылыңыз.',
    abortTitle: 'Жазылууну токтотосузбу?',
    abortText: 'Тандалган кызмат жана убакыт сакталбайт.',
    abortConfirm: 'Токтотуу',
    abortCancel: 'Жазылууну улантуу',
    closeA11y: 'Жазылууну жабуу',
    success: {
      titleApi: 'Арыз кабыл алынды',
      textApi: 'Администратор убакытты ырастоо үчүн чалат.',
      titleMessenger: 'Билдирүүнү жөнөтүү гана калды',
      textMessenger: (channel: string) =>
        `${channel} арыздын даяр тексти менен ачылды. «Жөнөтүү» баскычын басыңыз — администратор убакытты ырастайт.`,
      reopen: (channel: string) => `${channel} кайра ачуу`,
      myAppointments: 'Менин жазылууларым',
    },
    rescheduled: 'Жазылуу жылдырылды',
  },

  appointments: {
    title: 'Менин жазылууларым',
    upcoming: (n: number) => (n > 0 ? `Алдыда · ${n}` : 'Алдыда'),
    history: 'Тарых',
    emptyUpcomingTitle: 'Алдыда жазылуу жок',
    emptyUpcomingText: 'Онлайн жазылыңыз — бир мүнөт гана кетет.',
    emptyHistoryTitle: 'Тарых азырынча бош',
    emptyHistoryText: 'Бул жерде өткөн жана жокко чыгарылган жазылуулар көрүнөт.',
    status: {
      requested: 'Ырастоону күтүүдө',
      confirmed: 'Ырасталды',
      cancelled: 'Жокко чыгарылды',
      past: 'Өттү',
    },
  },

  appointment: {
    title: 'Жазылуу',
    service: 'Кызмат',
    doctor: 'Дарыгер',
    address: 'Дарек',
    patient: 'Бейтап',
    comment: 'Комментарий',
    reschedule: 'Жылдыруу',
    cancel: 'Жазылууну жокко чыгаруу',
    contact: 'Клиника менен байланышуу',
    bookAgain: 'Кайра жазылуу',
    cancelTitle: 'Жазылууну жокко чыгарасызбы?',
    cancelText: (label: string) => `Жазылуу жокко чыгарылат: ${label}.`,
    cancelConfirm: 'Жокко чыгаруу',
    cancelKeep: 'Калтыруу',
    cancelled: 'Жазылуу жокко чыгарылды',
    notFoundTitle: 'Жазылуу табылган жок',
    notFoundText: 'Балким, ал бул телефондон өчүрүлгөндүр.',
    addToCalendar: 'Календарга кошуу',
    calendarError: 'Бул телефондо календарды ачуу мүмкүн болгон жок.',
    calendarTitle: (clinic: string, service: string) => (service ? `${clinic}: ${service}` : clinic),
    contactMessage: (label: string, service: string) =>
      `Саламатсызбы! Жазылуум боюнча суроом бар: ${service}, ${label}.`,
  },

  messages: {
    newTitle: 'Саламатсызбы! Кабыл алууга жазылгым келет.',
    rescheduleTitle: 'Саламатсызбы! Жазылуумду башка убакытка жылдырып бериңизчи.',
    cancelTitle: 'Саламатсызбы! Жазылуумду жокко чыгаргым келет.',
    service: 'Кызмат',
    doctor: 'Дарыгер',
    date: 'Күнү',
    time: 'Убактысы',
    name: 'Аты',
    phone: 'Телефон',
    comment: 'Комментарий',
    previous: 'Мурунку убакыт',
    next: 'Жаңы убакыт',
    footer: 'SmileLab тиркемесинен жөнөтүлдү',
    wantedTime: 'Кааланган убакыт',
    newWantedTime: 'Жаңы кааланган убакыт',
    doctorPreferred: 'Дарыгер (мүмкүнчүлүккө жараша)',
  },

  profile: {
    title: 'Профиль',
    personal: 'Жеке маалымат',
    personalEmpty: 'Атыңызды жана телефонуңузду кошуңуз — жазылууда өзү толтурулат',
    language: 'Тил',
    myAppointments: 'Менин жазылууларым',
    contacts: 'Байланыш жана дарек',
    about: 'Клиника жөнүндө',
    privacy: 'Купуялык саясаты',
    deleteData: 'Маалыматымды телефондон өчүрүү',
    deleteTitle: 'Маалыматты өчүрөсүзбү?',
    deleteText:
      'Атыңыз, телефонуңуз жана жазылуулар бул телефондон өчүрүлөт. Клиникага мурда жөнөтүлгөн арыздар мындан жокко чыкпайт.',
    deleteConfirm: 'Өчүрүү',
    deleted: 'Маалымат өчүрүлдү',
    version: (version: string) => `Версия ${version}`,
    editTitle: 'Жеке маалымат',
    editHint: 'Маалымат ушул телефондо гана сакталат жана жазылуу формасына өзү коюлат.',
    email: 'E-mail',
    emailPlaceholder: 'name@example.com',
    saved: 'Сакталды',
  },

  contacts: {
    title: 'Байланыш',
    call: 'Чалуу',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    email: 'Электрондук почта',
    address: 'Дарек',
    addressUnknown: 'Так даректи администратордон тактаңыз',
    open2gis: '2ГИСте ачуу',
    openMap: 'Картадан ачуу',
    hours: 'Иштөө убактысы',
    today: 'бүгүн',
    dayOff: 'Дем алыш',
    breakLabel: (range: string) => `тыныгуу ${range}`,
    payment: 'Төлөм',
    paymentNote: 'Төлөм кабыл алуудан кийин клиникада.',
    paymentMethods: {
      cash: 'Накталай',
      card: 'Банк картасы',
      qr: 'Банктын тиркемеси аркылуу QR',
    },
  },

  about: {
    title: 'Клиника жөнүндө',
    lead: 'Тынч жана түшүнүктүү дарылайбыз: ар бир этапты түшүндүрөбүз, баасын дарылоо башталганга чейин айтабыз, кыргыз жана орус тилдеринде кабыл алабыз.',
    principlesTitle: 'Биз кантип иштейбиз',
    doctorsTitle: 'Дарыгерлер',
    hoursTitle: 'Иштөө убактысы',
  },

  privacy: {
    title: 'Купуялык саясаты',
    updated: '07.10.2026-жылдагы редакция',
    sections: (c) =>
      [
        {
          title: 'Маалыматты ким иштетет',
          body: [
            `Тиркеме ${c.clinic} стоматологиялык клиникасына таандык.`,
            c.operator
              ? `Жеке маалыматтардын оператору — ${c.operator.name}, ИНН ${c.operator.inn}, дареги: ${c.operator.address}.`
              : null,
          ]
            .filter(Boolean)
            .join(' '),
        },
        c.email || c.phone
          ? {
              title: 'Кайда кайрылуу керек',
              body: [
                c.email ? `Жеке маалымат боюнча суроолор: ${c.email}.` : null,
                c.phone ? `Клиниканын телефону: ${c.phone}.` : null,
              ]
                .filter(Boolean)
                .join(' '),
            }
          : null,
        {
          title: 'Кандай маалымат алабыз',
          body: 'Өзүңүз жазган маалыматты гана: атыңыз жана телефон номериңиз (жазылуу үчүн милдеттүү), жазылууга комментарий (милдеттүү эмес), профилдеги e-mail (милдеттүү эмес, телефондо калат). Комментарийди кыскача жазыңыз, мисалы «тиш ооруйт» же «консультация керек». Кеңири медициналык маалыматты, диагноздорду жана документтерди жазбаңыз.',
        },
        {
          title: 'Эмне үчүн керек',
          body: 'Сизди кабыл алууга жазуу, убакытты ырастоо жана жазылуу боюнча сиз менен байланышуу үчүн. Маалыматты жарнамага колдонбойбуз жана сатпайбыз.',
        },
        {
          title: 'Арыз клиникага кантип жетет',
          body: 'Арызды өзүңүз жөнөтөсүз: тиркеме WhatsApp же Telegram тиркемесин даяр текст менен ачат (кызмат, кааланган убакыт, аты, телефон, комментарий), билдирүү «Жөнөтүү» баскычын басканда гана кетет. Билдирүү Meta (WhatsApp) же Telegram кызматтары аркылуу өтөт жана алардын купуялык саясаттары менен да жөнгө салынат. Эгер клиника өз серверин туташтырса, арыз ага корголгон байланыш (HTTPS) аркылуу берилет.',
        },
        {
          title: 'Телефондо эмне сакталат',
          body: 'Профилдеги атыңыз, телефонуңуз жана e-mail жазылуу формасына коюу үчүн телефондун корголгон сактагычында сакталат. Жазылуулардын тизмесинде күнү, убактысы, кызмат, дарыгер жана атыңыз сакталат. Телефон номери жана жазылууга комментарий телефондо сакталбайт. Тиркеменин маалыматы телефондун камдык көчүрмөлөрүнө кирбейт.',
        },
        {
          title: 'Жарнама жана трекерлер',
          body: 'Тиркемеде жарнама, үчүнчү тараптын аналитикасы жана трекерлер жок.',
        },
        {
          title: 'Уруксаттар',
          body: 'Тиркемеге интернет жана басууга жооп катары титирөө гана керек. Камерага, микрофонго, байланыштарга, файлдарга жана жайгашкан жерге кирүү мүмкүнчүлүгү жок.',
        },
        {
          title: 'Маалыматты кантип өчүрүү керек',
          body: [
            'Тиркемеде: Профиль → «Маалыматымды телефондон өчүрүү». Бул профилди, жазылууларды жана жөндөөлөрдү телефондон өчүрөт.',
            c.email
              ? `Клиника алган арыздарды жана кат алышууну өчүрүү үчүн ${c.email} дарегине жазыңыз.`
              : 'Клиника алган арыздарды жана кат алышууну өчүрүү үчүн клиникага кайрылыңыз.',
          ].join(' '),
        },
        {
          title: 'Медициналык маалымат',
          body: 'Тиркеме медициналык буюм эмес жана ооруларды аныктабайт, дарылабайт жана алдын албайт. Дарылоо тууралуу чечимди дарыгер карап чыккандан кийин кабыл алат.',
        },
        {
          title: 'Өзгөртүүлөр',
          body: 'Саясат өзгөрсө, бул баракты жана редакциянын күнүн жаңылайбыз.',
        },
      ].filter((section): section is { title: string; body: string } => section !== null),
  },

  notFound: {
    title: 'Барак табылган жок',
    text: 'Шилтеме эскирип калышы мүмкүн. Башкы бетке кайтыңыз — ал жерден жазылып же чалсаңыз болот.',
  },

  errorBoundary: {
    title: 'Бир нерсе туура эмес болуп калды',
    text: 'Экранды кайра ачып көрүңүз. Ката кайталанса, бизге чалыңыз — телефон аркылуу жазабыз.',
    retry: 'Кайра аракет кылуу',
  },
};
