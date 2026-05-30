'use client';

import { useState } from 'react';
import { Strings } from '@/lib/i18n';
import { SavedRecord } from '@/lib/types';

interface Props {
  records: SavedRecord[];
  t: Strings;
  lang: 'ru' | 'en';
  onRequestDelete: (id: string) => void;
  onCopy: (text: string) => void;
}

function formatDate(iso: string, lang: 'ru' | 'en'): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function SavedRecords({
  records,
  t,
  lang,
  onRequestDelete,
  onCopy,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <section className="saved">
      <h2 className="saved-title">
        {t.savedTitle}
        {records.length > 0 && (
          <span className="saved-count">{records.length}</span>
        )}
      </h2>

      {records.length === 0 ? (
        <div className="saved-empty">{t.savedEmpty}</div>
      ) : (
        <div className="saved-list">
          {records.map((r) => {
            const isOpen = !!expanded[r._id];
            return (
              <div className="saved-item" key={r._id}>
                <div className="saved-meta">
                  <span>{formatDate(r.createdAt, lang)}</span>
                  {r.total > 0 && (
                    <span>
                      {t.totalNote} {r.total} ₽
                    </span>
                  )}
                </div>
                <pre
                  className={`saved-text${isOpen ? ' expanded' : ''}`}
                  onClick={() =>
                    setExpanded((s) => ({ ...s, [r._id]: !s[r._id] }))
                  }
                >
                  {r.text}
                </pre>
                <div className="saved-actions">
                  <button type="button" onClick={() => onCopy(r.text)}>
                    {t.copy}
                  </button>
                  <button
                    type="button"
                    className="del"
                    onClick={() => onRequestDelete(r._id)}
                  >
                    {t.deleteBtn}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
