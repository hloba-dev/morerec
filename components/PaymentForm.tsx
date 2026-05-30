'use client';

import { useCallback, useEffect, useState } from 'react';
import { BANKS } from '@/lib/banks';
import { I18N, Lang } from '@/lib/i18n';
import { generate, FieldError } from '@/lib/generate';
import { Method, PaymentInput, SavedRecord } from '@/lib/types';
import Modal from './Modal';
import SavedRecords from './SavedRecords';

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

type ConfirmAction =
  | { type: 'clear' }
  | { type: 'delete'; id: string }
  | null;

export default function PaymentForm() {
  const [lang, setLang] = useState<Lang>('ru');
  const [payments, setPayments] = useState<PaymentInput[]>(makeEmpty);
  const [errors, setErrors] = useState<Record<number, FieldError>>({});
  const [globalError, setGlobalError] = useState<string>('');
  const [genText, setGenText] = useState<string | null>(null);
  const [genTotal, setGenTotal] = useState<number>(0);
  const [genItems, setGenItems] = useState<PaymentInput[]>([]);

  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [toast, setToast] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const t = I18N[lang];

  // --- Загрузка истории из MongoDB ---
  const loadRecords = useCallback(async () => {
    try {
      const res = await fetch('/api/records');
      if (!res.ok) return;
      const data = await res.json();
      setRecords(data.records ?? []);
    } catch {
      /* офлайн — просто не показываем историю */
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

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
      setGenItems([]);
      setGenTotal(0);
      return;
    }
    setGenText(result.text);
    setGenTotal(result.total);
    setGenItems(result.items);
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
    setGenItems([]);
    setGenTotal(0);
  }, []);

  // --- Копирование с сохранением в Mongo ---
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

  const handleCopyGenerated = useCallback(async () => {
    if (!genText) return;
    await copyTextToClipboard(genText);
    showToast(t.copied);

    // Сохраняем скопированные реквизиты в MongoDB.
    setSaving(true);
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: genText,
          total: genTotal,
          lang,
          payments: genItems,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.record) {
          setRecords((prev) => [data.record, ...prev]);
        }
      }
    } catch {
      /* не удалось сохранить — текст всё равно скопирован */
    } finally {
      setSaving(false);
    }

    // После копирования и записи в историю — очищаем форму.
    doClear();
  }, [
    genText,
    genTotal,
    genItems,
    lang,
    copyTextToClipboard,
    showToast,
    t,
    doClear,
  ]);

  // Копирование из истории (без повторного сохранения).
  const handleCopySaved = useCallback(
    async (text: string) => {
      await copyTextToClipboard(text);
      showToast(t.copied);
    },
    [copyTextToClipboard, showToast, t],
  );

  // --- Удаление записи из Mongo ---
  const doDelete = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setRecords((prev) => prev.filter((r) => r._id !== id));
        }
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    if (!confirmAction) return;
    if (confirmAction.type === 'clear') doClear();
    else if (confirmAction.type === 'delete') doDelete(confirmAction.id);
    setConfirmAction(null);
  }, [confirmAction, doClear, doDelete]);

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
            <div
              className={`section${err ? ' has-error' : ''}`}
              key={idx}
            >
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
                <input
                  type="text"
                  inputMode="numeric"
                  value={p.number}
                  placeholder={t.placeholder}
                  onChange={(e) =>
                    updatePayment(idx, { number: e.target.value })
                  }
                />
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
            onClick={() => setConfirmAction({ type: 'clear' })}
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
                className={`copy-button${saving ? ' saving' : ''}`}
                onClick={handleCopyGenerated}
                disabled={saving}
              >
                {saving ? t.saving : t.copy}
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

      <SavedRecords
        records={records}
        t={t}
        lang={lang}
        onRequestDelete={(id) => setConfirmAction({ type: 'delete', id })}
        onCopy={handleCopySaved}
      />

      {confirmAction && (
        <Modal
          text={
            confirmAction.type === 'clear' ? t.clearConfirm : t.deleteConfirm
          }
          confirmLabel={
            confirmAction.type === 'clear' ? t.confirm : t.deleteBtn
          }
          cancelLabel={t.cancel}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
