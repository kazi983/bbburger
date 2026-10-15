"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.logout = logout;
exports.me = me;
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserModel_1 = require("../models/UserModel");
async function login(req, res) {
    const { email, password } = req.body;
    if (typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password) {
        return res.status(400).json({
            message: "Email and password are required.",
        });
    }
    const user = (0, UserModel_1.findByEmail)(email.trim());
    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password.",
        });
    }
    const passwordMatches = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!passwordMatches) {
        return res.status(401).json({
            message: "Invalid email or password.",
        });
    }
    if (!req.session) {
        return res.status(500).json({
            message: "Session is unavailable.",
        });
    }
    req.session.userId = user.id;
    return res.status(200).json({
        user: {
            email: user.email,
        },
    });
}
function logout(req, res) {
    req.session = null;
    return res.status(200).json({
        message: "Logged out successfully.",
    });
}
function me(req, res) {
    const userId = req.session?.userId;
    if (typeof userId !== "number") {
        return res.status(401).json({
            message: "Unauthorized.",
        });
    }
    const user = (0, UserModel_1.findById)(userId);
    if (!user) {
        req.session = null;
        return res.status(401).json({
            message: "Unauthorized.",
        });
    }
    return res.status(200).json({
        user: {
            email: user.email,
        },
    });
}
