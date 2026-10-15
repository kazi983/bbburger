import fs from "fs";
import path from "path";
import type { Order, BurgerOptions, OrderItem } from "../../../shared/types"

type Product = {
    id: number;
    name: string;
    price: number;
    category: string;
    ingredients: string[];
};

//What validateOrder() returns
type OrderResult = {
    errors: string[]; // empty array = the order is OK
    customerName: string;
    lines: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
}

const taxRate = 0.08;
const maxQuantity = 99;
const maxNameLength = 50;
const donenessChoices: BurgerOptions["doneness"][] = ["Medium rare", "Medium", "Well done"];

// Load the menu once at startup (server-side source of truth for prices)
// This file runs from backend/JS/models/, so go up two folders to reach backend/data/
const products: Product[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../data/product.json"), "utf-8")
);

// All placed orders, kept in server memory (they reset when the server restarts)
const orders: Order[] = [];
let nextOrderId = 1001;

function roundMoney(value: number) {
    return Math.round(value * 100) / 100;
}

//Make the next order number: 1001, 1002, 1003, ...
function createOrderId(){
    const orderId = nextOrderId;
    nextOrderId = nextOrderId + 1;
    return orderId;
}

// Check the order sent from the frontend and calculate the price.
// We use the prices in product.json, not the prices sent by the browser.
export function validateOrder(body: unknown): OrderResult {
    const errors: string[] = [];
    const lines: OrderItem[] = [];

    //1, check the customer name ( body should be object )
    let customerName = "";
    const b = body as { customerName?: unknown; items?: unknown } | undefined;
    if(typeof b?.customerName === 'string'){
        customerName = b.customerName.trim();
    }

    if(customerName === ""){
        errors.push("Customer name is required");
    } else if(customerName.length > maxNameLength){
        errors.push(`Customer name must be ${maxNameLength} characters or less.`);
    }

    //2, check the cart is not empty
    const items = b?.items;

    if(!Array.isArray(items) || items.length === 0){
        errors.push("Cart is empty.");
    } else {
        //3, check each item in the cart
        for(const item of items){
            const product = products.find((p) => {
                return p.id === item?.productId
            });

            if(!product){
                errors.push(`Products ${item?.productId} does not exist`);
                continue; // skip to the next item
            }

            const quantity = item.quantity;

            if(!Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantity){
                errors.push(`${product.name}: quantity must be between 1 and ${maxQuantity}`);
                continue; // skip to the next item
            }

            const line: OrderItem = {
                productId: product.id,
                productName: product.name,
                unitPrice: product.price,
                quantity: quantity,
            };

            //3-2, check the options (only burgers have options)
            if(product.category === "burguer"){
                // doneness must be one of the 3 choices
                const doneness = donenessChoices.find((choice) => {
                    return choice === item.options?.doneness
                });

                if(!doneness){
                    errors.push(`${product.name}: please choose how the burger is cooked`);
                    continue; // skip to the next item
                }

                // removedIngredients must be a list of this burger's ingredients
                const removedIngredients = item.options?.removedIngredients ?? [];

                if(!Array.isArray(removedIngredients)){
                    errors.push(`${product.name}: removed ingredients must be a list`);
                    continue; // skip to the next item
                }

                const unknownIngredient = removedIngredients.find((ingredient) => {
                    return !product.ingredients.includes(ingredient)
                });

                if(unknownIngredient !== undefined){
                    errors.push(`${product.name} does not have ${unknownIngredient}`);
                    continue; // skip to the next item
                }

                line.options = { doneness, removedIngredients };
            }

            lines.push(line);
        }
    }

    //4, calculate the price
    let subtotal = 0;
    for(const line of lines){
        subtotal = subtotal + line.unitPrice * line.quantity;
    }
    subtotal = roundMoney(subtotal);

    const tax = roundMoney(subtotal * taxRate);
    const total = roundMoney(subtotal + tax);

    return { errors, customerName, lines, subtotal, tax, total };
}

// Save a checked order in memory and return it
export function saveOrder(result: OrderResult): Order {
    const order: Order = {
        orderId: createOrderId(),
        customerName: result.customerName,
        orderedAt: Date.now(),
        status: "Received",
        items: result.lines,
        total: result.total,
    };

    orders.push(order);
    return order;
}

// Find a saved order by its number (for order tracking)
export function findOrderById(orderId: number) {
    return orders.find((order) => {
        return order.orderId === orderId
    });
}
