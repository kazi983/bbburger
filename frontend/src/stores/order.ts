import { atom } from "nanostores";

type Items = {
  quantity: number;
  name: string;
};

export type OrderMessage = {
  id: number;
  orderId: number;
  customerName: string;
  receivedAt: number;
  items: Items[];
};

export type Order = {
  kind: "message";
  message: OrderMessage;
};

export const $orderId = atom<number>(0);
export const $order = atom<Order | null>(null);
