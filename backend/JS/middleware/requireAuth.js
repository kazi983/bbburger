"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
function requireAuth(req, res, next) {
    const userId = req.session?.userId;
    if (typeof userId !== "number") {
        return res.status(401).json({
            message: "Unauthorized.",
        });
    }
    next();
}
