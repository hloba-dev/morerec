export type Method = '' | 'card' | 'tel' | 'sbp';

export interface PaymentInput {
  method: Method;
  number: string;
  bank: string; // value банка ('' если не выбран)
  amount: string;
}

export interface SavedRecord {
  _id: string;
  text: string;
  total: number;
  lang: 'ru' | 'en';
  payments: PaymentInput[];
  createdAt: string; // ISO
}
