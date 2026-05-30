import { bankLabel } from './banks';
import { I18N, Lang, Strings } from './i18n';
import { PaymentInput } from './types';

const LINE_SEPARATOR = '\n\n\n\n\n\n\n\n';
const NOTICE_SEPARATOR = '\n\n\n\n\n\n\n';

export interface FieldError {
  message: string;
  field?: 'bank' | 'amount';
}

export interface GenerateResult {
  /** Ошибки по индексу секции (0..3). */
  errors: Record<number, FieldError>;
  /** Готовый текст или null, если генерировать нечего / есть ошибки. */
  text: string | null;
  total: number;
  /** Только заполненные платежи (нормализованные). */
  items: PaymentInput[];
}

function normalizeAmount(raw: string): string {
  const trimmed = (raw || '').trim();
  if (trimmed === '') return '';
  return String(Math.max(0, Math.floor(Number(trimmed) || 0)));
}

function normalize(p: PaymentInput): PaymentInput {
  return {
    method: p.method,
    number: (p.number || '').trim(),
    bank: (p.bank || '').trim(),
    amount: normalizeAmount(p.amount),
  };
}

function isTouched(x: PaymentInput): boolean {
  return x.number !== '' || x.bank !== '' || x.amount !== '';
}

function buildLine(x: PaymentInput, t: Strings, lang: Lang): string {
  let label = '';
  if (x.method === 'card') label = t.cardText;
  else if (x.method === 'tel') label = t.phoneText;
  else if (x.method === 'sbp') label = t.sbpText;

  if (x.method === 'sbp' && (x.bank === '' || x.bank === 'Пусто')) {
    return t.chooseBank;
  }

  const bl = bankLabel(x.bank, lang);
  let line = `${label}  : [copytext]${x.number}[/copytext]`;
  if (x.bank && x.bank !== 'Пусто') {
    line += ` ${t.strict} ${bl}`;
  }
  if (x.amount) {
    line += ` =  ${x.amount}р`;
  }
  line += `  ${t.perThese}`;
  return line;
}

export function generate(payments: PaymentInput[], lang: Lang): GenerateResult {
  const t = I18N[lang];
  const normalized = payments.map(normalize);
  const touched = normalized.filter(isTouched);
  const touchedCount = touched.length;

  // ВАЛИДАЦИЯ — индексы соответствуют исходным секциям.
  const errors: Record<number, FieldError> = {};
  let hasErrors = false;

  normalized.forEach((x, i) => {
    if (!isTouched(x)) return;

    if (!x.method) {
      errors[i] = { message: t.noMethod };
      hasErrors = true;
      return;
    }
    if (x.method === 'sbp' && (x.bank === '' || x.bank === 'Пусто')) {
      errors[i] = { message: t.noBankSbp, field: 'bank' };
      hasErrors = true;
      return;
    }
    if (touchedCount >= 2 && !x.amount) {
      errors[i] = { message: t.noAmount, field: 'amount' };
      hasErrors = true;
      return;
    }
  });

  if (hasErrors) {
    return { errors, text: null, total: 0, items: [] };
  }

  if (touched.length === 0) {
    return { errors, text: null, total: 0, items: [] };
  }

  // Один платёж без суммы — короткий формат.
  if (touched.length === 1 && !touched[0].amount) {
    const x = touched[0];
    const bl = bankLabel(x.bank, lang);
    const bankSuffix = x.bank && x.bank !== 'Пусто' ? ` ${bl}` : '';
    let res = '';
    if (x.method === 'card') {
      res = `${t.cardText}: [copytext]${x.number}[/copytext]${bankSuffix}`;
    } else if (x.method === 'tel') {
      res = `${t.phoneText}: [copytext]${x.number}[/copytext]${bankSuffix}`;
    } else if (x.method === 'sbp') {
      res =
        x.bank && x.bank !== 'Пусто'
          ? `${t.sbpText}: [copytext]${x.number}[/copytext] ${t.strictSbp} ${bl}`
          : t.chooseBank;
    }
    return { errors, text: res, total: 0, items: touched };
  }

  // Общий случай.
  const lines: string[] = [];
  let total = 0;
  touched.forEach((x) => {
    lines.push(buildLine(x, t, lang));
    if (x.amount) total += Number(x.amount) || 0;
  });

  let result = lines.join(LINE_SEPARATOR);
  if (touched.length >= 2) {
    result += NOTICE_SEPARATOR + t.notice(touched.length);
  }

  return { errors, text: result, total, items: touched };
}
