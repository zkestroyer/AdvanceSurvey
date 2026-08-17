"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided', data: null, errors: ['no_token'] });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        // Attempt to parse permissions if it's a string (FCR #7 structured permissions)
        if (decoded && typeof decoded === 'object' && typeof decoded.permissions === 'string') {
            try {
                decoded.permissions = JSON.parse(decoded.permissions);
            }
            catch (e) {
                // Fallback to original string if parse fails
            }
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token', data: null, errors: ['invalid_token'] });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map