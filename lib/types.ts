export type Method = '' | 'card' | 'tel' | 'sbp';

export interface PaymentInput {
  method: Method;
  number: string;
  bank: string; // value банка ('' если не выбран)
  amount: string;
}
