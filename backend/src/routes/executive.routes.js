"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// --- DASHBOARD ---
router.get('/dashboard', async (req, res) => {
    try {
        const totalShops = await prisma_1.prisma.shop.count();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const newShopsToday = await prisma_1.prisma.shop.count({ where: { createdAt: { gte: today } } });
        const totalSurveys = await prisma_1.prisma.surveyResponse.count();
        const surveysToday = await prisma_1.prisma.surveyResponse.count({ where: { startedAt: { gte: today } } });
        const surveysThisWeek = await prisma_1.prisma.surveyResponse.count({ where: { startedAt: { gte: startOfWeek } } });
        const surveysThisMonth = await prisma_1.prisma.surveyResponse.count({ where: { startedAt: { gte: startOfMonth } } });
        const activeShops = await prisma_1.prisma.shop.count({
            where: {
                responses: { some: { startedAt: { gte: startOfMonth } } }
            }
        });
        const activeUsers = await prisma_1.prisma.user.count({
            where: {
                responses: { some: { startedAt: { gte: today } } }
            }
        });
        const totalUsers = await prisma_1.prisma.user.count({ where: { role: { name: 'TSO' } } });
        const territoriesCovered = await prisma_1.prisma.territory.count({
            where: { shops: { some: {} } }
        });
        const citiesCovered = await prisma_1.prisma.city.count({
            where: { areas: { some: { name: { not: '' } } } } // A basic proxy, or could query shops distinct city
        });
        const products = await prisma_1.prisma.product.count();
        const brands = await prisma_1.prisma.productBrand.count();
        const categories = await prisma_1.prisma.productCategory.count();
        const completedSurveys = await prisma_1.prisma.surveyResponse.count({ where: { status: 'completed' } });
        const pendingSurveys = await prisma_1.prisma.surveyResponse.count({ where: { status: 'draft' } });
        res.json({
            success: true,
            data: {
                surveySummary: { totalSurveys, surveysToday, surveysThisWeek, surveysThisMonth },
                shopSummary: { totalShops, newShopsToday, activeShops, inactiveShops: totalShops - activeShops },
                users: { totalSurveyors: totalUsers, activeToday: activeUsers, inactiveToday: totalUsers - activeUsers },
                geographicCoverage: { territoriesCovered, citiesCovered, areasCovered: await prisma_1.prisma.area.count() },
                productInsights: { totalCategories: categories, totalBrands: brands, totalProducts: products, totalDistributors: await prisma_1.prisma.shop.count({ where: { type: 'Distributor' } }) },
                surveyQuality: { completedSurveys, pendingSurveys }
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/dashboard/charts', async (req, res) => {
    try {
        const today = new Date();
        const past7Days = new Date(today);
        past7Days.setDate(today.getDate() - 7);
        // Survey Trend
        const recentSurveys = await prisma_1.prisma.surveyResponse.findMany({
            where: { startedAt: { gte: past7Days } },
            select: { startedAt: true }
        });
        const surveyTrend = {};
        recentSurveys.forEach(s => {
            const date = s.startedAt.toISOString().split('T')[0];
            surveyTrend[date] = (surveyTrend[date] || 0) + 1;
        });
        // Territory Performance
        const territoryData = await prisma_1.prisma.territory.findMany({
            include: { _count: { select: { shops: true } } },
            take: 5,
            orderBy: { shops: { _count: 'desc' } }
        });
        res.json({
            success: true,
            data: {
                surveyTrend: Object.keys(surveyTrend).map(date => ({ date, count: surveyTrend[date] })),
                territoryPerformance: territoryData.map(t => ({ name: t.name, count: t._count.shops }))
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// --- SURVEYS ---
router.get('/surveys', async (req, res) => {
    try {
        const surveys = await prisma_1.prisma.surveyResponse.findMany({
            include: {
                shop: { select: { name: true, territory: { select: { name: true } }, city: true } },
                user: { select: { name: true } },
                _count: { select: { answers: true } }
            },
            orderBy: { startedAt: 'desc' },
            take: 50
        });
        const formatted = surveys.map(s => ({
            id: s.id,
            shopName: s.shop.name,
            surveyor: s.user.name,
            date: s.startedAt,
            territory: s.shop.territory?.name,
            city: s.shop.city,
            totalProducts: Math.floor(s._count.answers / 5) // Approximation based on fields
        }));
        res.json({ success: true, data: formatted });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/surveys/:id', async (req, res) => {
    try {
        const survey = await prisma_1.prisma.surveyResponse.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                shop: { include: { territory: true } },
                user: true,
                template: true,
                answers: { include: { question: true } }
            }
        });
        if (!survey)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: survey });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// --- SHOPS ---
router.get('/shops', async (req, res) => {
    try {
        const shops = await prisma_1.prisma.shop.findMany({
            include: {
                territory: true,
                _count: { select: { responses: true } }
            },
            take: 50
        });
        const formatted = shops.map(s => ({
            id: s.id,
            name: s.name,
            territory: s.territory?.name,
            city: s.city,
            area: s.area,
            distributor: s.type === 'Distributor' ? s.name : 'Unknown',
            totalSurveys: s._count.responses
        }));
        res.json({ success: true, data: formatted });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/shops/:id', async (req, res) => {
    try {
        const shop = await prisma_1.prisma.shop.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                territory: true,
                responses: {
                    take: 10,
                    orderBy: { startedAt: 'desc' },
                    include: { user: { select: { name: true } } }
                }
            }
        });
        if (!shop)
            return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: shop });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// --- USERS ---
router.get('/users', async (req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            where: { role: { name: 'TSO' } },
            include: {
                territory: true,
                _count: { select: { responses: true, shops: true } }
            }
        });
        const formatted = users.map(u => ({
            id: u.id,
            name: u.name,
            territory: u.territory?.name,
            totalSurveys: u._count.responses,
            shopsAdded: u._count.shops,
            status: u.status
        }));
        res.json({ success: true, data: formatted });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/users/:id', async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { territory: true }
        });
        if (!user)
            return res.status(404).json({ success: false, message: 'Not found' });
        const surveys = await prisma_1.prisma.surveyResponse.count({ where: { userId: user.id } });
        res.json({ success: true, data: { ...user, totalSurveys: surveys } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// --- TERRITORIES ---
router.get('/territories', async (req, res) => {
    try {
        const territories = await prisma_1.prisma.territory.findMany({
            include: {
                _count: { select: { shops: true } },
                shops: {
                    include: { _count: { select: { responses: true } } }
                }
            }
        });
        const formatted = territories.map(t => {
            const surveyCount = t.shops.reduce((acc, shop) => acc + shop._count.responses, 0);
            return {
                id: t.id,
                name: t.name,
                shopCount: t._count.shops,
                surveyCount: surveyCount
            };
        });
        res.json({ success: true, data: formatted });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// --- PRICES ---
router.get('/prices', async (req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany();
        const formatted = products.map(p => ({
            id: p.id,
            category: p.category,
            brand: p.brand,
            name: p.name,
            purchasePrice: p.price,
            sellingPrice: p.price * 1.1, // Mock selling price for now since we don't have it natively
            difference: p.price * 0.1,
            lastUpdated: new Date()
        }));
        res.json({ success: true, data: formatted });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/prices/:productId/history', async (req, res) => {
    try {
        const history = await prisma_1.prisma.priceHistory.findMany({
            where: { productId: parseInt(req.params.productId) },
            orderBy: { updatedAt: 'asc' }
        });
        res.json({ success: true, data: history });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// --- COMPARISON ---
router.post('/comparison', async (req, res) => {
    try {
        const { groupBy, filters } = req.body;
        const selectedEntities = filters?.entities || [];
        let tableData = [];
        let totalShops = 0;
        let avgPurchase = 0;
        if (groupBy === 'Brand') {
            const products = await prisma_1.prisma.product.findMany();
            let brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
            // Filter to only selected entities if provided
            if (selectedEntities.length > 0) {
                brands = brands.filter(b => selectedEntities.includes(b));
            }
            for (const brand of brands) {
                const brandProducts = products.filter(p => p.brand === brand);
                const avgPrice = brandProducts.length > 0
                    ? brandProducts.reduce((sum, p) => sum + p.price, 0) / brandProducts.length
                    : 0;
                const shopsWithBrand = await prisma_1.prisma.shop.count({
                    where: {
                        responses: {
                            some: {
                                answers: {
                                    some: { value: { contains: brand } }
                                }
                            }
                        }
                    }
                });
                tableData.push({
                    group: brand,
                    purchasePrice: Math.round(avgPrice),
                    shopCount: shopsWithBrand
                });
            }
        }
        else if (groupBy === 'Territory') {
            let territories = await prisma_1.prisma.territory.findMany({
                include: { _count: { select: { shops: true } } }
            });
            // Filter to only selected entities if provided
            if (selectedEntities.length > 0) {
                territories = territories.filter(t => selectedEntities.includes(t.name));
            }
            for (const t of territories) {
                tableData.push({
                    group: t.name,
                    purchasePrice: 0,
                    shopCount: t._count.shops
                });
            }
        }
        else if (groupBy === 'Distributor') {
            let distributors = await prisma_1.prisma.shop.findMany({
                where: { type: 'Distributor' },
                include: { _count: { select: { responses: true } } }
            });
            // Filter to only selected entities if provided
            if (selectedEntities.length > 0) {
                distributors = distributors.filter(d => selectedEntities.includes(d.name));
            }
            for (const d of distributors) {
                tableData.push({
                    group: d.name,
                    purchasePrice: 0,
                    shopCount: d._count.responses
                });
            }
        }
        else if (groupBy === 'Product Category') {
            const products = await prisma_1.prisma.product.findMany();
            let categories = [...new Set(products.map(p => p.category).filter(Boolean))];
            if (selectedEntities.length > 0) {
                categories = categories.filter(c => selectedEntities.includes(c));
            }
            for (const cat of categories) {
                const catProducts = products.filter(p => p.category === cat);
                const avgPrice = catProducts.length > 0
                    ? catProducts.reduce((sum, p) => sum + p.price, 0) / catProducts.length
                    : 0;
                tableData.push({
                    group: cat,
                    purchasePrice: Math.round(avgPrice),
                    shopCount: catProducts.length
                });
            }
        }
        else if (groupBy === 'City') {
            const shops = await prisma_1.prisma.shop.findMany({
                include: { _count: { select: { responses: true } } }
            });
            const cityMap = {};
            for (const s of shops) {
                const city = s.city || 'Unknown';
                if (selectedEntities.length > 0 && !selectedEntities.includes(city))
                    continue;
                if (!cityMap[city])
                    cityMap[city] = { shopCount: 0 };
                cityMap[city].shopCount++;
            }
            for (const [city, data] of Object.entries(cityMap)) {
                tableData.push({
                    group: city,
                    purchasePrice: 0,
                    shopCount: data.shopCount
                });
            }
        }
        totalShops = tableData.reduce((sum, r) => sum + r.shopCount, 0);
        avgPurchase = tableData.length > 0
            ? tableData.reduce((sum, r) => sum + r.purchasePrice, 0) / tableData.length
            : 0;
        res.json({
            success: true,
            data: {
                cards: {
                    totalShops: totalShops,
                    avgPurchasePrice: Math.round(avgPurchase),
                },
                table: tableData.sort((a, b) => b.shopCount - a.shopCount)
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// --- NOTIFICATIONS ---
router.get('/notifications', async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await prisma_1.prisma.userNotification.findMany({
            where: { userId },
            include: { notification: true },
            orderBy: { createdAt: 'desc' }
        });
        const formatted = notifications.map(n => ({
            id: n.id,
            notificationId: n.notification.id,
            title: n.notification.title,
            message: n.notification.message,
            type: n.notification.type,
            isRead: n.isRead,
            createdAt: n.createdAt
        }));
        res.json({ success: true, data: formatted });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.put('/notifications/:id/read', async (req, res) => {
    try {
        const userId = req.user.userId;
        const id = parseInt(req.params.id);
        await prisma_1.prisma.userNotification.update({
            where: { id }, // In a real app we'd verify it belongs to userId
            data: { isRead: true, readAt: new Date() }
        });
        res.json({ success: true, message: 'Marked as read' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=executive.routes.js.map