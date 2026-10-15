import fs from "fs";
import path from "path";
import type {
  Order,
  BurgerOptions,
  OrderItem,
  OrderStatus,
} from "../../../shared/types";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  ingredients: string[];
};

//What validateOrder() returns
type ValidOrder = {
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
};

const taxRate = 0.08;
const maxQuantity = 99;
const maxNameLength = 50;
const donenessChoices: BurgerOptions["doneness"][] = [
  "Medium rare",
  "Medium",
  "Well done",
];

// Load the menu once at startup (server-side source of truth for prices)
// This file runs from backend/JS/models/, so go up two folders to reach backend/data/
const products: Product[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../data/product.json"), "utf-8"),
);

// All placed orders, kept in server memory (they reset when the server restarts)
export const orders: Order[] = [];
let nextOrderId = 1001;

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

//Make the next order number: 1001, 1002, 1003, ...
function createOrderId() {
  const orderId = nextOrderId;
  nextOrderId = nextOrderId + 1;
  return orderId;
}

type OrderError = {
  error: string;
};

// Check the order sent from the frontend and calculate the price.
// We use the prices in product.json, not the prices sent by the browser.
export function validateOrder(body: unknown): OrderError | ValidOrder {
  const items: OrderItem[] = [];

  //1, check the customer name ( body should be object )
  let customerName = "";
  const b = body as { customerName?: unknown; items?: unknown } | undefined;
  if (typeof b?.customerName === "string") {
    customerName = b.customerName.trim();
  }

  if (customerName === "") {
    return { error: "Customer name is required" };
  }
  if (customerName.length > maxNameLength) {
    return {
      error: `Customer name must be ${maxNameLength} characters or less`,
    };
  }

  //2, check the cart is not empty
  const cartItems = b?.items;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { error: "Cart is empty." };
  } else {
    //3, check each item in the cart
    for (const item of cartItems) {
      const product = products.find((p) => {
        return p.id === item?.productId;
      });

      if (!product) {
        return { error: `Products ${item?.productId} does not exist` };
      }

      const quantity = item.quantity;

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > maxQuantity
      ) {
        return {
          error: `${product.name}: quantity must be between 1 and ${maxQuantity}`,
        };
      }

      const orderItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: quantity,
      };

      //3-2, check the options (only burgers have options)
      if (product.category === "burguer") {
        // doneness must be one of the 3 choices
        const doneness = donenessChoices.find((choice) => {
          return choice === item.options?.doneness;
        });

        if (!doneness) {
          return {
            error: `${product.name}: please choose how the burger is cooked`,
          };
        }

        // removedIngredients must be a list of this burger's ingredients
        const removedIngredients = item.options?.removedIngredients ?? [];

        if (!Array.isArray(removedIngredients)) {
          return {
            error: `${product.name}: removed ingredients must be a list`,
          };
        }

        const unknownIngredient = removedIngredients.find((ingredient) => {
          return !product.ingredients.includes(ingredient);
        });

        if (unknownIngredient !== undefined) {
          return {
            error: `${product.name} does not have ${unknownIngredient}`,
          };
        }

        orderItem.options = { doneness, removedIngredients };
      }

      items.push(orderItem);
    }
  }

  //4, calculate the price
  let subtotal = 0;
  for (const orderItem of items) {
    subtotal = subtotal + orderItem.unitPrice * orderItem.quantity;
  }
  subtotal = roundMoney(subtotal);

  const tax = roundMoney(subtotal * taxRate);
  const total = roundMoney(subtotal + tax);

  return { customerName, items, subtotal, tax, total };
}

// Save a checked order in memory and return it
export function saveOrder(result: ValidOrder): Order {
  const order: Order = {
    orderId: createOrderId(),
    customerName: result.customerName,
    orderedAt: Date.now(),
    status: "Received",
    items: result.items,
    total: result.total,
  };

  orders.push(order);
  return order;
}

export function findAllOrders() {
  return orders;
}

// Find a saved order by its number (for order tracking)
export function findOrderById(orderId: number): Order | undefined {
  return orders.find((order) => {
    return order.orderId === orderId;
  });
}

// Change the status of a saved order and return it (undefined if not found)
export function setOrderStatus(
  orderId: number,
  status: OrderStatus,
): Order | undefined {
  const order = findOrderById(orderId);

  if (!order) {
    return undefined;
  }

  order.status = status;
  if (status === "Delivered") order.completedAt = Date.now();

  return order;
}
