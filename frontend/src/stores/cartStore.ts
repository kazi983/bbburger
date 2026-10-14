import { atom } from "nanostores";

type CartItem = {
  productId: number;
  quantity: number;
};

export const cart = atom<CartItem[]>([]);

const storageKey = "awshaf-cart";

export function loadCart() {
  try {
    const savedCart = localStorage.getItem(storageKey);

    if (!savedCart) return;

    const items = JSON.parse(savedCart);

    if (
      Array.isArray(items) &&
      items.every(
        (item) =>
          item !== null &&
          Number.isInteger(item.productId) &&
          item.productId > 0 &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0
      )
    ) {
      cart.set(items);
    }
  } catch {
    cart.set([]);
  }
}

export function addToCart(productId: number) {
  const items = cart.get();
  const existingItem = items.find(
    (item) => item.productId === productId
  );

  if (existingItem) {
    cart.set(
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  } else {
    cart.set([...items, { productId, quantity: 1 }]);
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(cart.get()));
  } catch {
    // The cart still works if browser storage is unavailable.
  }
}