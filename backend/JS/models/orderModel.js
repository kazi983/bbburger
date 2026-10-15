"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderId = createOrderId;
exports.validateOrder = validateOrder;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const taxRate = 0.08;
const maxQuantity = 99;
const maxNameLength = 50;
// Load the menu once at startup (server-side source of truth for prices)
// This file runs from backend/JS/models/, so go up two folders to reach backend/data/
const products = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, "../../data/product.json"), "utf-8"));
function roundMoney(value) {
    return Math.round(value * 100) / 100;
}
//Make a rondom order number like '#FG-1234'
function createOrderId() {
    return `#FG-${Math.floor(1000 + Math.random() * 9000)}`;
}
// Check the order sent from the frontend and calculate the price.
// We use the prices in product.json, not the prices sent by the browser.
function validateOrder(body) {
    const errors = [];
    const lines = [];
    //1, check the customer name ( body should be object )
    let customerName = "";
    const b = body;
    if (typeof b?.customerName === 'string') {
        customerName = b.customerName.trim();
    }
    if (customerName === "") {
        errors.push("Customer name is required");
    }
    else if (customerName.length > maxNameLength) {
        errors.push(`Customer name must be ${maxNameLength} characters or less.`);
    }
    //2, check the cart is not empty
    const items = b?.items;
    if (!Array.isArray(items) || items.length === 0) {
        errors.push("Cart is empty.");
    }
    else {
        //3, check each item in the cart
        for (const item of items) {
            const product = products.find((p) => {
                return p.id === item?.productId;
            });
            if (!product) {
                errors.push(`Products ${item?.productId} does not exist`);
                continue; // skip to the next item
            }
            const quantity = item.quantity;
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantity) {
                errors.push(`${product.name}: quantity must be between 1 and ${maxQuantity}`);
                continue; // skip to the next item
            }
            lines.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                lineTotal: roundMoney(product.price * quantity),
            });
        }
    }
    //4, calculate the price
    let subtotal = 0;
    for (const line of lines) {
        subtotal = subtotal + line.lineTotal;
    }
    subtotal = roundMoney(subtotal);
    const tax = roundMoney(subtotal * taxRate);
    const total = roundMoney(subtotal + tax);
    return { errors, customerName, lines, subtotal, tax, total };
}
