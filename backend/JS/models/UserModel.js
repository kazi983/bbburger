"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByEmail = findByEmail;
exports.findById = findById;
exports.seedAdmin = seedAdmin;
const bcrypt_1 = __importDefault(require("bcrypt"));
const users = [];
function findByEmail(email) {
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}
function findById(id) {
    return users.find((user) => user.id === id);
}
function seedAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured.");
    }
    if (findByEmail(adminEmail)) {
        return;
    }
    const passwordHash = bcrypt_1.default.hashSync(adminPassword, 10);
    users.push({
        id: 1,
        email: adminEmail,
        passwordHash,
    });
}
