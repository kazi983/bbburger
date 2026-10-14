import { atom } from "nanostores";

type CartItem = {
  productId: number;
  quantity: number;
};

export const cart = atom<CartItem[]>([]);

const storageKey = "awshaf-cart";

function saveCart() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cart.get()));
  } catch {
    // The cart remains usable without browser storage.
  }
}

export function loadCart() {
  cart.set([]);

  try {
    const savedCart = localStorage.getItem(storageKey);

    if (!savedCart) return;

    const items = JSON.parse(savedCart);

    if (
      Array.isArray(items) &&
      items.every(
        (item) =>
          item !== null &&
          Number.isSafeInteger(item.productId) &&
          item.productId > 0 &&
          Number.isSafeInteger(item.quantity) &&
          item.quantity > 0
      )
    ) {
      const mergedItems: CartItem[] = [];

      items.forEach((item: CartItem) => {
        const existingItem = mergedItems.find(
          (entry) => entry.productId === item.productId
        );

        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          mergedItems.push({
            productId: item.productId,
            quantity: item.quantity,
          });
        }
      });

      if (
        mergedItems.every((item) =>
          Number.isSafeInteger(item.quantity)
        )
      ) {
        cart.set(mergedItems);
      }
    }
  } catch {
    cart.set([]);
  }
}

export function addToCart(productId: number) {
  if (!Number.isSafeInteger(productId) || productId < 1) return;

  const items = cart.get();
  const existingItem = items.find(
    (item) => item.productId === productId
  );

  if (existingItem) {
    updateQuantity(productId, existingItem.quantity + 1);
    return;
  }

  cart.set([...items, { productId, quantity: 1 }]);
  saveCart();
}

export function updateQuantity(productId: number, quantity: number) {
  if (!Number.isSafeInteger(quantity) || quantity < 0) return;

  if (quantity === 0) {
    removeFromCart(productId);
    return;
  }

  cart.set(
    cart.get().map((item) =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    )
  );

  saveCart();
}

export function removeFromCart(productId: number) {
  cart.set(
    cart.get().filter((item) => item.productId !== productId)
  );

  saveCart();
}

export function clearCart() {
  cart.set([]);
  saveCart();
}