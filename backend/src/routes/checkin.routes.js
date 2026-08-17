"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Log GPS Check-in
router.post('/', async (req, res) => {
    try {
        const { shopId, lat, lng, latitude, longitude } = req.body;
        const userId = req.user.userId;
        const finalLat = lat || latitude;
        const finalLng = lng || longitude;
        let finalShopId = parseInt(shopId);
        const shop = await prisma_1.prisma.shop.findUnique({ where: { id: finalShopId } });
        if (!shop) {
            console.log(`Shop ${finalShopId} not found. Returning success to unblock client sync queue.`);
            return res.json({ success: true, message: "Shop deleted, checkin ignored" });
        }
        const checkin = await prisma_1.prisma.checkIn.create({
            data: {
                shopId: finalShopId,
                userId,
                latitude: finalLat,
                longitude: finalLng
            }
        });
        res.json({ success: true, message: 'Check-in logged successfully', data: checkin, errors: null });
    }
    catch (error) {
        console.error('[CHECKIN ERROR]', error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
exports.default = router;
//# sourceMappingURL=checkin.routes.js.map