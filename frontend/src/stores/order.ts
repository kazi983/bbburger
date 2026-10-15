import { atom } from "nanostores";

export type BurgerOptions = {
  doneness: "Medium rare" | "Medium" | "Well done";
  removedIngredients: string[];
};

type OrderItem = {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  options?: BurgerOptions;
};

export type Order = {
  orderId: number;
  customerName: string;
  orderedAt: number;
  status: "Received" | "Preparing" | "Ready"| "Delivered";
  items: OrderItem[];
  total: number;
};


export const $orderId = atom<number>(0);
export const $order = atom<Order | null>(null);
export const $orders = atom<Order[]>([]);
