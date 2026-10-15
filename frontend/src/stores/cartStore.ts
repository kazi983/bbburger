import { atom } from "nanostores";

export type BurgerOptions = {
  removedIngredients: string[];
  doneness: "" | "Medium rare" | "Medium" | "Well done";
};

export type CartItem = {
  key: string;
  productId: number;
  quantity: number;
  options: BurgerOptions;
};

export const cart = atom<CartItem[]>([]);

const storageKey = "awshaf-cart";

function normalizeOptions(
  options?: Partial<BurgerOptions>
): BurgerOptions {
  const removedIngredients = Array.isArray(options?.removedIngredients)
    ? [...new Set(
        options.removedIngredients.filter(
          (ingredient) => typeof ingredient === "string"
        )
      )].sort()
    : [];

  const doneness =
    options?.doneness === "Medium rare" ||
    options?.doneness === "Medium" ||
    options?.doneness === "Well done"
      ? options.doneness
      : "";

  return { removedIngredients, doneness };
}

function createItemKey(
  productId: number,
  options: BurgerOptions
) {
  return JSON.stringify([
    productId,
    options.doneness,
    options.removedIngredients,
  ]);
}

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

    const savedItems = JSON.parse(savedCart);

    if (!Array.isArray(savedItems)) return;

    const items: CartItem[] = [];

    savedItems.forEach((item) => {
      if (
        !item ||
        !Number.isSafeInteger(item.productId) ||
        item.productId < 1 ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return;
      }

      const options = normalizeOptions(item.options);
      const key = createItemKey(item.productId, options);
      const existingItem = items.find((entry) => entry.key === key);

      if (existingItem) {
        const quantity = existingItem.quantity + item.quantity;

        if (Number.isSafeInteger(quantity)) {
          existingItem.quantity = quantity;
        }
      } else {
        items.push({
          key,
          productId: item.productId,
          quantity: item.quantity,
          options,
        });
      }
    });

    cart.set(items);
  } catch {
    cart.set([]);
  }
}

export function addToCart(
  productId: number,
  selectedOptions?: Partial<BurgerOptions>
) {
  if (!Number.isSafeInteger(productId) || productId < 1) return;

  const options = normalizeOptions(selectedOptions);
  const key = createItemKey(productId, options);

  const existingItem = cart.get().find((item) => item.key === key);

  if (existingItem) {
    updateCartItem(key, existingItem.quantity + 1);
    return;
  }

  cart.set([
    ...cart.get(),
    {
      key,
      productId,
      quantity: 1,
      options,
    },
  ]);

  saveCart();
}

export function updateCartItem(key: string, quantity: number) {
  if (!Number.isSafeInteger(quantity) || quantity < 0) return;

  if (quantity === 0) {
    removeCartItem(key);
    return;
  }

  cart.set(
    cart.get().map((item) =>
      item.key === key ? { ...item, quantity } : item
    )
  );

  saveCart();
}

export function removeCartItem(key: string) {
  cart.set(cart.get().filter((item) => item.key !== key));
  saveCart();
}

// Keeps the existing summary working until we update its controls.
export function updateQuantity(productId: number, quantity: number) {
  const item = cart.get().find(
    (item) => item.productId === productId
  );

  if (item) {
    updateCartItem(item.key, quantity);
  }
}

export function removeFromCart(productId: number) {
  const item = cart.get().find(
    (item) => item.productId === productId
  );

  if (item) {
    removeCartItem(item.key);
  }
}

export function clearCart() {
  cart.set([]);
  saveCart();
}