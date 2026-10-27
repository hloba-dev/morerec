'use client';

import { useCallback, useEffect, useState } from 'react';
import { BANKS } from '@/lib/banks';
import { I18N, Lang } from '@/lib/i18n';
import { generate, FieldError } from '@/lib/generate';
import { Method, PaymentInput } from '@/lib/types';
import { normalizePasted } from '@/lib/paste';
import Modal from './Modal';

const PAYMENTS_COUNT = 4;

const EMPTY_PAYMENT: PaymentInput = {
  method: '',
  number: '',
  bank: '',
  amount: '',
};

function makeEmpty(): PaymentInput[] {
  return Array.from({ length: PAYMENTS_COUNT }, () => ({ ...EMPTY_PAYMENT }));
}

export default function PaymentForm() {
  const [lang, setLang] = useState<Lang>('ru');
  const [payments, setPayments] = useState<PaymentInput[]>(makeEmpty);
  const [errors, setErrors] = useState<Record<number, FieldError>>({});
  const [globalError, setGlobalError] = useState<string>('');
  const [genText, setGenText] = useState<string | null>(null);
  const [genTotal, setGenTotal] = useState<number>(0);

  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState<string>('');

  const t = I18N[lang];

  // --- Тост-уведомление ---
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2200);
  }, []);

  // --- Изменение поля платежа ---
  const updatePayment = useCallback(
    (idx: number, patch: Partial<PaymentInput>) => {
      setPayments((prev) =>
        prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
      );
      // сбрасываем ошибку секции при редактировании
      setErrors((prev) => {
        if (!(idx in prev)) return prev;
        const next = { ...prev };
        delete next[idx];
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    setGlobalError(Object.keys(errors).length > 0 ? t.globalError : '');
  }, [errors, t]);

  // --- Генерация текста ---
  const handleGenerate = useCallback(() => {
    const result = generate(payments, lang);
    setErrors(result.errors);
    if (Object.keys(result.errors).length > 0 || result.text === null) {
      setGenText(null);
      setGenTotal(0);
      return;
    }
    setGenText(result.text);
    setGenTotal(result.total);
  }, [payments, lang]);

  // Перегенерация при смене языка, если текст уже показан или есть ошибки.
  useEffect(() => {
    if (genText !== null || Object.keys(errors).length > 0) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // --- Очистка формы ---
  const doClear = useCallback(() => {
    setPayments(makeEmpty());
    setErrors({});
    setGlobalError('');
    setGenText(null);
    setGenTotal(0);
  }, []);

  // --- Копирование в буфер ---
  const copyTextToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback для старых iOS / небезопасного контекста
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
  }, []);

  // --- Вставка из буфера в поле номера конкретного платежа ---
  const handlePaste = useCallback(
    async (idx: number, e: React.MouseEvent<HTMLButtonElement>) => {
      // Поле рядом с кнопкой — чтобы сфокусировать его, если буфер недоступен.
      const input = e.currentTarget.parentElement?.querySelector('input');
      let raw: string;
      try {
        if (!navigator.clipboard?.readText) throw new Error('unsupported');
        raw = await navigator.clipboard.readText();
      } catch {
        // Firefox / небезопасный контекст / отказ в разрешении:
        // ставим фокус, чтобы пользователь вставил системным способом.
        input?.focus();
        showToast(t.pasteFailed);
        return;
      }
      const value = normalizePasted(raw);
      if (value === '') {
        showToast(t.pasteEmpty);
        return;
      }
      updatePayment(idx, { number: value });
    },
    [showToast, t, updatePayment],
  );

  const handleCopyGenerated = useCallback(async () => {
    if (!genText) return;
    await copyTextToClipboard(genText);
    showToast(t.copied);
    // После копирования — очищаем форму.
    doClear();
  }, [genText, copyTextToClipboard, showToast, t, doClear]);

  // --- Переключение языка ---
  const toggleLang = useCallback(() => {
    setLang((l) => (l === 'ru' ? 'en' : 'ru'));
  }, []);

  return (
    <div className="page">
      <header className="app-header">
        <h1 className="app-title">
          {lang === 'ru' ? 'Реквизиты' : 'Payment details'}
        </h1>
        <button type="button" className="lang-toggle" onClick={toggleLang}>
          {lang === 'ru' ? 'EN' : 'RU'}
        </button>
      </header>

      <div className="payment-form">
        {payments.map((p, idx) => {
          const err = errors[idx];
          return (
            <div className={`section${err ? ' has-error' : ''}`} key={idx}>
              <div className="section-title">
                <span className="label">{t.section(idx + 1)}</span>
                {err && <span className="section-error">{err.message}</span>}
              </div>

              <div className="methods">
                {(['card', 'tel', 'sbp'] as Method[]).map((m) => (
                  <button
                    type="button"
                    key={m}
                    className={`btn-method${p.method === m ? ' active' : ''}`}
                    onClick={() => updatePayment(idx, { method: m })}
                  >
                    {m === 'card' ? t.cardBtn : m === 'tel' ? t.telBtn : t.sbpBtn}
                  </button>
                ))}
              </div>

              <div className="fields">
                <div className="field-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={p.number}
                    placeholder={t.placeholder}
                    onChange={(e) =>
                      updatePayment(idx, { number: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="paste-btn"
                    aria-label={`${t.paste}: ${t.placeholder}`}
                    onClick={(e) => handlePaste(idx, e)}
                  >
                    {t.paste}
                  </button>
                </div>
                <select
                  value={p.bank}
                  className={err?.field === 'bank' ? 'field-error' : ''}
                  onChange={(e) => updatePayment(idx, { bank: e.target.value })}
                >
                  <option value="">{t.selectPlaceholder}</option>
                  {BANKS.map((b) => (
                    <option value={b.value} key={b.value}>
                      {lang === 'ru' ? b.ru : b.en}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={p.amount}
                  className={err?.field === 'amount' ? 'field-error' : ''}
                  placeholder={t.amountPlaceholder}
                  onChange={(e) =>
                    updatePayment(idx, { amount: e.target.value })
                  }
                />
              </div>
            </div>
          );
        })}

        {globalError && <div className="global-error">{globalError}</div>}

        <div className="actions-row">
          <button
            type="button"
            className="action secondary"
            onClick={() => setConfirmClear(true)}
          >
            {t.clear}
          </button>
          <button type="button" className="action" onClick={handleGenerate}>
            {t.generate}
          </button>
        </div>

        {genText !== null && (
          <div className="gen-box">
            <pre>{genText}</pre>
            <div className="copy-line">
              <button
                type="button"
                className="copy-button"
                onClick={handleCopyGenerated}
              >
                {t.copy}
              </button>
              {genTotal > 0 && (
                <span className="sum-note">
                  {t.totalNote} {genTotal} ₽
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {confirmClear && (
        <Modal
          text={t.clearConfirm}
          confirmLabel={t.confirm}
          cancelLabel={t.cancel}
          onConfirm={() => {
            doClear();
            setConfirmClear(false);
          }}
          onCancel={() => setConfirmClear(false)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
