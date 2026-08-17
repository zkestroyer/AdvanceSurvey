"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    try {
        const { email, password, platform, remember } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required', data: null, errors: ['validation_error'] });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: { role: true, territory: true }
        });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials', data: null, errors: ['invalid_credentials'] });
        }
        if (platform === 'web' && user.role.name.toLowerCase() === 'tso') {
            return res.status(403).json({ success: false, message: 'Access Denied: Field officers must use the mobile app.', data: null, errors: ['forbidden_role'] });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials', data: null, errors: ['invalid_credentials'] });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role.name, territoryId: user.territoryId }, process.env.JWT_SECRET || 'secret', { expiresIn: remember ? '30d' : '1d' });
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role.name,
                    territory: user.territory?.name
                }
            },
            errors: null
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ success: false, message: 'Email required' });
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Return success anyway to prevent email enumeration
            return res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent.'
            });
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
        await prisma_1.prisma.user.update({
            where: { email },
            data: { resetToken, resetTokenExpiry }
        });
        const mockLink = `http://localhost:5173/atsolar/#/reset-password?token=${resetToken}`;
        res.json({
            success: true,
            message: 'If the email exists, a password reset link has been sent.',
            mockLink
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token and new password required' });
        }
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        res.json({ success: true, message: 'Password has been successfully reset.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/change-password', async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;
        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: parseInt(userId.toString()) } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const isMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect old password' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });
        res.json({ success: true, message: 'Password successfully changed.' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/support-ticket', async (req, res) => {
    try {
        const { email, name, message } = req.body;
        if (!message)
            return res.status(400).json({ success: false, message: 'Message required' });
        const subject = message.length > 50 ? message.substring(0, 50) + '...' : message;
        await prisma_1.prisma.supportTicket.create({
            data: {
                email: email || null,
                name: name || null,
                message,
                subject,
                status: 'Open',
                priority: 'Medium'
            }
        });
        res.json({
            success: true,
            message: 'Your message has been sent to the administrator.'
        });
    }
    catch (error) {
        console.error('Support ticket error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map