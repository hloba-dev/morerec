export type Lang = 'ru' | 'en';

export function pluralizeRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export interface Strings {
  section: (idx: number) => string;
  cardBtn: string;
  telBtn: string;
  sbpBtn: string;
  placeholder: string;
  selectPlaceholder: string;
  amountPlaceholder: string;
  generate: string;
  clear: string;
  clearConfirm: string;
  copy: string;
  copied: string;
  cardText: string;
  phoneText: string;
  sbpText: string;
  chooseBank: string;
  noMethod: string;
  noBankSbp: string;
  noAmount: string;
  globalError: string;
  strict: string;
  strictSbp: string;
  perThese: string;
  notice: (n: number) => string;
  totalNote: string;
  // дополнительные строки для интерфейса истории
  savedTitle: string;
  savedEmpty: string;
  deleteConfirm: string;
  deleteBtn: string;
  cancel: string;
  confirm: string;
  saving: string;
}

export const I18N: Record<Lang, Strings> = {
  ru: {
    section: (idx) => `Платёж ${idx}`,
    cardBtn: 'Карта',
    telBtn: 'Телефон',
    sbpBtn: 'СБП',
    placeholder: 'Введите номер',
    selectPlaceholder: 'Выберите банк',
    amountPlaceholder: 'Сумма (₽)',
    generate: 'Сгенерировать',
    clear: 'Стереть',
    clearConfirm: 'Стереть все введённые данные?',
    copy: 'Скопировать',
    copied: 'Скопировано',
    cardText: 'Номер карты',
    phoneText: 'Номер телефона',
    sbpText: 'Номер телефона для перевода по СБП',
    chooseBank: 'Пожалуйста, выберите банк',
    noMethod: '⚠ Не указан метод оплаты',
    noBankSbp: '⚠ Для СБП обязательно выберите банк',
    noAmount: '⚠ Укажите сумму платежа',
    globalError: 'Исправьте ошибки в выделенных секциях',
    strict: 'СТРОГО банк',
    strictSbp: 'выбирать СТРОГО банк:',
    perThese: 'по этим реквизитам.',
    notice: (n) =>
      `Обратите внимание, вам нужно разбить сумму на ${n} ${pluralizeRu(
        n,
        'платёж',
        'платежа',
        'платежей',
      )}, перевести нужно строго так как указано, и предоставить ${n} ${pluralizeRu(
        n,
        'квитанцию',
        'квитанции',
        'квитанций',
      )}. Спасибо за понимание`,
    totalNote: 'Итого :',
    savedTitle: 'Сохранённые реквизиты',
    savedEmpty: 'Пока ничего не сохранено',
    deleteConfirm: 'Удалить эту запись?',
    deleteBtn: 'Удалить',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    saving: 'Сохранение…',
  },
  en: {
    section: (idx) => `Payment ${idx}`,
    cardBtn: 'Card',
    telBtn: 'Phone',
    sbpBtn: 'SBP',
    placeholder: 'Enter number',
    selectPlaceholder: 'Select bank',
    amountPlaceholder: 'Amount (₽)',
    generate: 'Generate',
    clear: 'Clear',
    clearConfirm: 'Clear all entered data?',
    copy: 'Copy',
    copied: 'Copied',
    cardText: 'Card number',
    phoneText: 'Phone number',
    sbpText: 'Phone number for SBP transfer',
    chooseBank: 'Please choose a bank',
    noMethod: '⚠ Payment method not selected',
    noBankSbp: '⚠ Bank is required for SBP transfer',
    noAmount: '⚠ Amount is required',
    globalError: 'Fix errors in highlighted sections',
    strict: 'STRICT bank',
    strictSbp: 'choose ONLY bank:',
    perThese: 'for these details.',
    notice: (n) =>
      `Note: you must split the total into ${n} ${
        n === 1 ? 'payment' : 'payments'
      }, send exactly as specified, and provide ${n} ${
        n === 1 ? 'receipt' : 'receipts'
      }. Thank you.`,
    totalNote: 'Total (not for client):',
    savedTitle: 'Saved details',
    savedEmpty: 'Nothing saved yet',
    deleteConfirm: 'Delete this record?',
    deleteBtn: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm',
    saving: 'Saving…',
  },
};
