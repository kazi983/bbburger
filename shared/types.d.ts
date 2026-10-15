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

export type OrderStatus = "Received" | "Preparing" | "Ready" | "Delivered";

export type Order = {
  orderId: number;
  customerName: string;
  orderedAt: number;
  completedAt?: number;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
};

// TODO: Replace the contents of frontend/src/stores/order.ts and frontend/src/lib/order.ts with these types

export type PublicUser = {
  email: string;
};
