export interface Bank {
  value: string;
  ru: string;
  en: string;
}

// Полностью соответствует конфигу банков из PHP-плагина.
export const BANKS: Bank[] = [
  { value: 'Сбер', ru: 'Сбер', en: 'Sberbank' },
  { value: 'Т-Банк', ru: 'Т-Банк', en: 'T-Bank' },
  { value: 'Альфа-Банк', ru: 'Альфа-Банк', en: 'Alfa-Bank' },
  { value: 'Озон', ru: 'Озон', en: 'Ozon' },
  { value: 'ПСБ', ru: 'ПСБ', en: 'PSB' },
  { value: 'Райфайзен', ru: 'Райфайзен', en: 'Raiffeisenbank' },
  { value: 'ВТБ', ru: 'ВТБ', en: 'VTB' },
  { value: 'Ощадбанк', ru: 'Ощадбанк', en: 'Oschadbank' },
  { value: 'Пусто', ru: 'Пусто', en: 'Empty' },
];

export function bankLabel(value: string, lang: 'ru' | 'en'): string {
  const b = BANKS.find((b) => b.value === value);
  if (!b) return '';
  return lang === 'ru' ? b.ru : b.en;
}
