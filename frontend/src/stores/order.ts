import { atom } from "nanostores";

type Items = {
  productId: number;
  unitPrice: number;
  productName: string;
  quantity: number;
};

export type Order = {
  orderId: number;
  customerName: string;
  status: string;
  orderedAt: number;
  completedAt?: number;
  total: number;
  items: Items[];
};

export const $orderId = atom<number>(0);
export const $order = atom<Order | null>(null);
export const $orders = atom<Order[]>([]);
