import { formatMoney } from '../utils/money';
import { pluralRu } from './plural';

/**
 * Русский словарь — источник формы. ky.ts объявлен как `Strings`,
 * поэтому TypeScript не даст пропустить ключ.
 */
export const ru = {
  languageName: 'Русский',

  common: {
    clinicKind: 'Стоматологическая клиника',
    back: 'Назад',
    close: 'Закрыть',
    retry: 'Повторить',
    cancel: 'Отмена',
    save: 'Сохранить',
    continue: 'Далее',
    change: 'Изменить',
    all: 'Все',
    toHome: 'На главную',
    book: 'Записаться',
    bookVisit: 'Записаться на приём',
    demoBadge: 'Демо',
    demoNotice: 'Демо-режим: цены, врачи и расписание — примеры. Заявки не уходят в клинику автоматически.',
    priceFrom: (amount: number) => `от ${formatMoney(amount)}`,
    priceOnConsultation: 'Цена после консультации',
    duration: (minutes: number) => `≈ ${minutes} мин`,
    loading: 'Загрузка',
    loadErrorTitle: 'Не удалось загрузить',
    loadErrorText: 'Проверьте интернет и попробуйте ещё раз.',
    couldNotOpen: (value: string) => `Не удалось открыть приложение. Контакт клиники: ${value}`,
    couldNotOpenLink: 'Не удалось открыть ссылку. Попробуйте ещё раз.',
  },

  languages: {
    ky: 'Кыргызча',
    ru: 'Русский',
    /** Языки приёма врача. */
    speaks: (langs: ('ky' | 'ru')[]): string => {
      const hasKy = langs.includes('ky');
      const hasRu = langs.includes('ru');
      if (hasKy && hasRu) return 'Кыргызский и русский';
      return hasKy ? 'Кыргызский' : 'Русский';
    },
  },

  dates: {
    today: 'Сегодня',
    tomorrow: 'Завтра',
    months: [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря',
    ],
    weekdays: {
      mon: 'понедельник',
      tue: 'вторник',
      wed: 'среда',
      thu: 'четверг',
      fri: 'пятница',
      sat: 'суббота',
      sun: 'воскресенье',
    },
    weekdaysShort: { mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс' },
    /** «в понедельник», «во вторник»… */
    onWeekday: {
      mon: 'в понедельник',
      tue: 'во вторник',
      wed: 'в среду',
      thu: 'в четверг',
      fri: 'в пятницу',
      sat: 'в субботу',
      sun: 'в воскресенье',
    },
    /** «30 сентября» */
    long: (day: number, month: string) => `${day} ${month}`,
    /** «30 сентября, среда» */
    withWeekday: (date: string, weekday: string) => `${date}, ${weekday}`,
    /** «Сегодня, 30 сентября» */
    relative: (relative: string, date: string) => `${relative}, ${date}`,
    /** «30 сентября, 15:00» */
    dateTime: (date: string, time: string) => `${date}, ${time}`,
    range: (start: string, end: string) => `${start}–${end}`,
  },

  a11y: {
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
    back: 'Назад',
    callClinic: 'Позвонить в клинику',
    whatsappClinic: 'Написать в WhatsApp',
    telegramClinic: 'Написать в Telegram',
    emailClinic: 'Написать на почту',
    addressClinic: 'Открыть адрес клиники на карте',
    logo: 'SmileLab',
    stepProgress: (step: number, total: number) => `Шаг ${step} из ${total}`,
    day: (label: string, state: 'available' | 'full' | 'closed') =>
      state === 'available'
        ? `${label}, есть свободное время`
        : state === 'full'
          ? `${label}, мест нет`
          : `${label}, выходной`,
    slot: (time: string) => `Время ${time}`,
    upcomingDot: 'есть предстоящая запись',
    dismissToast: 'Скрыть уведомление',
  },

  tabs: {
    home: 'Главная',
    services: 'Услуги',
    appointments: 'Записи',
    profile: 'Профиль',
  },

  menu: {
    home: 'Главная',
    services: 'Услуги и цены',
    appointments: 'Мои записи',
    about: 'О клинике',
    contacts: 'Контакты',
    profile: 'Профиль',
    language: 'Язык',
  },

  onboarding: {
    title: 'Тилди тандаңыз · Выберите язык',
  },

  home: {
    quickCall: 'Позвонить',
    quickWhatsApp: 'WhatsApp',
    quickTelegram: 'Telegram',
    quickAddress: 'Адрес',
    status: {
      openUntil: (time: string) => `Сегодня открыто до\u00A0${time}`,
      breakUntil: (time: string) => `Сейчас перерыв до\u00A0${time}`,
      opensToday: (time: string) => `Сейчас закрыто · откроемся сегодня в\u00A0${time}`,
      opensTomorrow: (time: string) => `Сейчас закрыто · откроемся завтра в\u00A0${time}`,
      opensOn: (onWeekday: string, time: string) => `Сейчас закрыто · откроемся ${onWeekday} в\u00A0${time}`,
      unknown: 'Часы работы уточняйте у администратора',
    },
    nextAppointment: 'Ближайшая запись',
    servicesTitle: 'Услуги и цены',
    servicesAll: 'Все услуги',
    doctorsTitle: 'Врачи',
    promoMore: 'Подробнее',
    startTitle: 'Не знаете, с чего начать?',
    startText: 'Запишитесь на консультацию: врач осмотрит, объяснит варианты лечения и назовёт точную стоимость.',
    startConsult: 'Записаться на консультацию',
    startAsk: 'Задать вопрос',
    askMessage: 'Здравствуйте! У меня вопрос.',
  },

  services: {
    title: 'Услуги и цены',
    subtitle: 'Указаны цены «от». Точную стоимость врач назовёт после осмотра.',
  },

  service: {
    price: 'Стоимость',
    duration: 'Длительность',
    about: 'О процедуре',
    included: 'Что входит',
    process: 'Как проходит лечение',
    processCount: (n: number) => `${n} ${pluralRu(n, 'этап', 'этапа', 'этапов')}`,
    expectations: 'Чего ожидать',
    faq: 'Частые вопросы',
    doctors: 'Врачи',
    book: 'Записаться',
    ask: 'Спросить',
    askA11y: (channel: string) => `Задать вопрос в ${channel}`,
    askMessage: (service: string) => `Здравствуйте! Хочу узнать подробнее про услугу «${service}».`,
    notFoundTitle: 'Услуга не найдена',
    notFoundText: 'Возможно, её убрали из списка. Посмотрите все услуги.',
  },

  doctor: {
    languages: 'Языки приёма',
    days: 'Дни приёма',
    services: 'Услуги',
    book: 'Записаться к врачу',
    dayOff: 'выходной',
    notFoundTitle: 'Врач не найден',
    notFoundText: 'Посмотрите список врачей на странице клиники.',
  },

  booking: {
    serviceTitle: 'Какая услуга нужна?',
    serviceHint: 'Если не уверены — выберите консультацию.',
    datetimeTitle: 'Выберите дату и время',
    rescheduleTitle: 'Перенос записи',
    rescheduleCurrent: (label: string) => `Сейчас: ${label}`,
    anyDoctor: 'Любой врач',
    anyFreeDoctor: 'Любой свободный врач',
    morning: 'Утро',
    afternoon: 'День',
    evening: 'Вечер',
    noSlotsDay: 'В этот день свободного времени нет.',
    dayClosed: 'В этот день клиника не работает.',
    nearest: (label: string) => `Ближайшее свободное — ${label}`,
    show: 'Показать',
    noSlotsAtAll: 'Свободного времени на ближайшие недели нет. Позвоните — подберём удобное время.',
    call: 'Позвонить',
    selectTime: 'Выберите время',
    rescheduleTo: (label: string) => `Перенести на ${label}`,
    detailsTitle: 'Проверьте и подтвердите',
    summaryService: 'Услуга',
    summaryWhen: 'Дата и время',
    summaryDoctor: 'Врач',
    nameLabel: 'Имя',
    namePlaceholder: 'Как к вам обращаться',
    phoneLabel: 'Телефон',
    commentLabel: 'Что вас беспокоит?',
    commentPlaceholder: 'Например: болит зуб слева',
    optional: 'необязательно',
    paymentLine: 'Оплата в клинике после приёма: наличные, карта, QR через приложение банка.',
    consentPrefix: 'Нажимая кнопку, вы соглашаетесь с ',
    consentLink: 'политикой конфиденциальности',
    consentSuffix: '.',
    submitWhatsApp: 'Отправить заявку в WhatsApp',
    submitTelegram: 'Отправить заявку в Telegram',
    submit: 'Записаться',
    errors: {
      nameEmpty: 'Введите имя',
      nameShort: 'Имя слишком короткое',
      phoneEmpty: 'Введите номер телефона',
      phoneIncomplete: 'Нужно 9 цифр после +996',
      phoneInvalidPrefix: 'После +996 номер не начинается с 0 или 1',
      emailInvalid: 'Проверьте адрес почты',
    },
    slotTaken: 'Это время только что заняли. Выберите другое.',
    submitError: 'Не удалось отправить заявку. Попробуйте ещё раз.',
    abortTitle: 'Прервать запись?',
    abortText: 'Выбранные услуга и время не сохранятся.',
    abortConfirm: 'Прервать',
    abortCancel: 'Продолжить запись',
    closeA11y: 'Закрыть запись',
    success: {
      titleApi: 'Заявка принята',
      textApi: 'Администратор позвонит, чтобы подтвердить время.',
      titleMessenger: 'Осталось отправить сообщение',
      textMessenger: (channel: string) =>
        `Мы открыли ${channel} с готовым текстом заявки. Нажмите «Отправить» — и администратор подтвердит время.`,
      titleDemo: 'Заявка сохранена',
      textDemo: (channel: string) =>
        `Демо-режим: заявка сохранена только на телефоне. Чтобы клиника её получила, отправьте её в ${channel}.`,
      reopen: (channel: string) => `Открыть ${channel} ещё раз`,
      sendManually: (channel: string) => `Отправить в ${channel}`,
      myAppointments: 'Мои записи',
    },
    rescheduled: 'Запись перенесена',
  },

  appointments: {
    title: 'Мои записи',
    upcoming: (n: number) => (n > 0 ? `Предстоящие · ${n}` : 'Предстоящие'),
    history: 'История',
    emptyUpcomingTitle: 'Нет предстоящих записей',
    emptyUpcomingText: 'Запишитесь онлайн — это займёт минуту.',
    emptyHistoryTitle: 'История пока пуста',
    emptyHistoryText: 'Здесь появятся прошедшие и отменённые записи.',
    status: {
      requested: 'Ждёт подтверждения',
      confirmed: 'Подтверждена',
      cancelled: 'Отменена',
      past: 'Прошла',
    },
  },

  appointment: {
    title: 'Запись',
    service: 'Услуга',
    doctor: 'Врач',
    address: 'Адрес',
    patient: 'Пациент',
    comment: 'Комментарий',
    reschedule: 'Перенести',
    cancel: 'Отменить запись',
    contact: 'Связаться с клиникой',
    bookAgain: 'Записаться снова',
    cancelTitle: 'Отменить запись?',
    cancelText: (label: string) => `Запись на ${label} будет отменена.`,
    cancelConfirm: 'Отменить запись',
    cancelKeep: 'Не отменять',
    cancelled: 'Запись отменена',
    notFoundTitle: 'Запись не найдена',
    notFoundText: 'Возможно, она была удалена с этого телефона.',
    contactMessage: (label: string, service: string) =>
      `Здравствуйте! У меня вопрос по записи: ${service}, ${label}.`,
  },

  messages: {
    newTitle: 'Здравствуйте! Хочу записаться на приём.',
    rescheduleTitle: 'Здравствуйте! Прошу перенести мою запись.',
    cancelTitle: 'Здравствуйте! Хочу отменить запись.',
    service: 'Услуга',
    doctor: 'Врач',
    date: 'Дата',
    time: 'Время',
    name: 'Имя',
    phone: 'Телефон',
    comment: 'Комментарий',
    previous: 'Было',
    next: 'Стало',
    footer: 'Отправлено из приложения SmileLab',
  },

  profile: {
    title: 'Профиль',
    personal: 'Личные данные',
    personalEmpty: 'Добавьте имя и телефон — подставим их в запись',
    language: 'Язык',
    myAppointments: 'Мои записи',
    contacts: 'Контакты и адрес',
    about: 'О клинике',
    privacy: 'Политика конфиденциальности',
    deleteData: 'Удалить мои данные с телефона',
    deleteTitle: 'Удалить данные?',
    deleteText:
      'Имя, телефон и записи будут удалены с этого телефона. Заявки, которые уже отправлены в клинику, это не отменит.',
    deleteConfirm: 'Удалить',
    deleted: 'Данные удалены',
    version: (version: string) => `Версия ${version}`,
    editTitle: 'Личные данные',
    editHint: 'Данные хранятся только на этом телефоне и подставляются в форму записи.',
    email: 'E-mail',
    emailPlaceholder: 'name@example.com',
    saved: 'Сохранено',
  },

  contacts: {
    title: 'Контакты',
    call: 'Позвонить',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    email: 'Почта',
    address: 'Адрес',
    addressUnknown: 'Точный адрес уточняйте у администратора',
    open2gis: 'Открыть в 2ГИС',
    openMap: 'Открыть на карте',
    hours: 'Часы работы',
    today: 'сегодня',
    dayOff: 'Выходной',
    breakLabel: (range: string) => `перерыв ${range}`,
    payment: 'Оплата',
    paymentNote: 'Оплата в клинике после приёма.',
    paymentMethods: {
      cash: 'Наличные',
      card: 'Банковская карта',
      qr: 'QR через приложение банка',
    },
  },

  about: {
    title: 'О клинике',
    lead: 'Лечим спокойно и понятно: объясняем каждый этап, называем цену до начала лечения и принимаем на кыргызском и русском.',
    principlesTitle: 'Как мы работаем',
    doctorsTitle: 'Врачи',
    hoursTitle: 'Часы работы',
  },

  privacy: {
    title: 'Политика конфиденциальности',
    updated: 'Редакция от 30.09.2026',
    sections: (c: { clinic: string; phone: string; email: string }) => [
      {
        title: 'Кто мы',
        body: `Приложение принадлежит стоматологической клинике ${c.clinic}. Связаться с нами: ${c.phone}, ${c.email}.`,
      },
      {
        title: 'Какие данные мы получаем',
        body: 'Только то, что вы вводите сами: имя, номер телефона, e-mail (необязательно) и комментарий к записи (необязательно). Комментарий может содержать сведения о здоровье — пишите только то, чем готовы поделиться с клиникой.',
      },
      {
        title: 'Зачем они нужны',
        body: 'Чтобы записать вас на приём, подтвердить время и связаться с вами по поводу записи. Мы не используем данные для рекламы и не продаём и не передаём их третьим лицам.',
      },
      {
        title: 'Где хранятся данные',
        body: 'Профиль и записи хранятся только на вашем телефоне. Клиника получает заявку, когда вы её отправляете: через WhatsApp, Telegram или сервер клиники. Передача идёт по защищённому соединению. Данные приложения не попадают в резервные копии телефона.',
      },
      {
        title: 'Реклама и трекеры',
        body: 'В приложении нет рекламы, сторонней аналитики и трекеров.',
      },
      {
        title: 'Разрешения',
        body: 'Приложению нужны только доступ в интернет и вибрация для отклика на нажатия. Доступа к камере, микрофону, контактам, файлам и геолокации у него нет.',
      },
      {
        title: 'Как удалить данные',
        body: `В приложении: Профиль → «Удалить мои данные с телефона». Чтобы клиника удалила полученные заявки, напишите нам: ${c.email} или ${c.phone}.`,
      },
      {
        title: 'Медицинская информация',
        body: 'Приложение не является медицинским изделием и не диагностирует, не лечит и не предотвращает заболевания. Решение о лечении принимает врач после осмотра.',
      },
      {
        title: 'Изменения',
        body: 'Если политика изменится, мы обновим эту страницу и дату редакции.',
      },
    ],
  },

  notFound: {
    title: 'Страница не найдена',
    text: 'Возможно, ссылка устарела. Вернитесь на главную — оттуда можно записаться или позвонить.',
  },

  errorBoundary: {
    title: 'Что-то пошло не так',
    text: 'Попробуйте открыть экран ещё раз. Если ошибка повторится, позвоните нам — запишем по телефону.',
    retry: 'Попробовать снова',
  },
};

export type Strings = typeof ru;
