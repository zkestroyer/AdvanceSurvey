"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Helper for date ranges
const getDateRange = (dateRange) => {
    if (!dateRange)
        return {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateRange === 'today') {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return { gte: today, lte: end };
    }
    if (dateRange === 'month') {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        return { gte: start, lte: end };
    }
    return {};
};
// 1. Dashboard Counters
router.get('/dashboard', async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
        const monthEnd = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0, 23, 59, 59, 999);
        const totalShops = await prisma_1.prisma.shop.count();
        const shopsAddedToday = await prisma_1.prisma.shop.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } });
        const shopsAddedThisMonth = await prisma_1.prisma.shop.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } });
        const totalSurveys = await prisma_1.prisma.surveyResponse.count({ where: { status: 'completed' } });
        const surveysToday = await prisma_1.prisma.surveyResponse.count({ where: { completedAt: { gte: todayStart, lte: todayEnd }, status: 'completed' } });
        const surveysThisMonth = await prisma_1.prisma.surveyResponse.count({ where: { completedAt: { gte: monthStart, lte: monthEnd }, status: 'completed' } });
        const activeTSOs = await prisma_1.prisma.user.count({ where: { role: { name: 'TSO' }, status: 'Active' } });
        const bdmRecords = await prisma_1.prisma.user.findMany({
            where: { role: { name: 'TSO' }, assignedBdmId: { not: null } },
            select: { assignedBdmId: true },
            distinct: ['assignedBdmId']
        });
        const activeBDMs = bdmRecords.length;
        const territoriesCovered = await prisma_1.prisma.territory.count();
        const areasCovered = await prisma_1.prisma.area.count();
        const avgSurveysPerTSO = activeTSOs > 0 ? (totalSurveys / activeTSOs).toFixed(1) : 0;
        // Pending Surveys (excluding draft per user feedback, assume 'pending' status if it exists, else 0)
        const pendingSurveys = await prisma_1.prisma.surveyResponse.count({ where: { status: { notIn: ['completed', 'draft'] } } });
        const data = {
            totalShops,
            shopsAddedToday,
            shopsAddedThisMonth,
            totalSurveys,
            surveysToday,
            surveysThisMonth,
            activeTSOs,
            activeBDMs,
            territoriesCovered,
            areasCovered,
            avgSurveysPerTSO,
            pendingSurveys,
            coveragePercentage: totalShops > 0 ? Math.round((totalSurveys / totalShops) * 100) : 0
        };
        res.json({ success: true, message: 'Analytics retrieved', data, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
// 2. Dashboard Charts
router.get('/dashboard/charts', async (req, res) => {
    try {
        // Top 10 TSOs
        const topTSOsRaw = await prisma_1.prisma.surveyResponse.groupBy({
            by: ['userId'],
            _count: { id: true },
            where: { status: 'completed' },
            orderBy: { _count: { id: 'desc' } },
            take: 10
        });
        const topTSOs = await Promise.all(topTSOsRaw.map(async (t) => {
            const u = await prisma_1.prisma.user.findUnique({ where: { id: t.userId } });
            return { name: u?.name || 'Unknown', surveys: t._count.id };
        }));
        // Surveys by Territory
        const territories = await prisma_1.prisma.territory.findMany({ include: { shops: { include: { responses: { where: { status: 'completed' } } } } } });
        const surveysByTerritory = territories.map(t => ({
            name: t.name,
            surveys: t.shops.reduce((acc, shop) => acc + shop.responses.length, 0)
        })).filter(t => t.surveys > 0);
        // Surveys by Area (if shop has area)
        const shopsWithArea = await prisma_1.prisma.shop.findMany({ include: { responses: { where: { status: 'completed' } } }, where: { area: { not: null } } });
        const areaMap = {};
        shopsWithArea.forEach(s => {
            if (!areaMap[s.area])
                areaMap[s.area] = 0;
            areaMap[s.area] += s.responses.length;
        });
        const surveysByArea = Object.keys(areaMap).map(a => ({ name: a, surveys: areaMap[a] }));
        res.json({ success: true, data: { topTSOs, surveysByTerritory, surveysByArea }, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, data: null });
    }
});
// 3. Reports Data
router.get('/reports/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { dateRange, territoryId, area, bdmId, tsoId, shopId, status } = req.query;
        // Base filters
        const dateFilter = getDateRange(dateRange);
        let data = [];
        switch (type) {
            case 'shop-addition':
                data = await prisma_1.prisma.shop.findMany({
                    where: {
                        createdAt: dateFilter,
                        ...(territoryId && { territoryId: Number(territoryId) }),
                        ...(area && { area: String(area) }),
                    },
                    include: { territory: true, checkIns: { include: { user: { include: { assignedBdm: true } } }, take: 1 } },
                    orderBy: { createdAt: 'desc' }
                });
                // Map to expected columns
                data = data.map((s) => ({
                    id: s.id, shopName: s.name, ownerName: s.ownerName, territory: s.territory?.name, area: s.area,
                    addedBy: s.checkIns[0]?.user?.name || 'Admin',
                    bdm: s.checkIns[0]?.user?.assignedBdm?.name || 'N/A',
                    dateAdded: s.createdAt
                }));
                break;
            case 'tso-shop-addition':
                const tsos = await prisma_1.prisma.user.findMany({
                    where: { role: { name: 'TSO' }, ...(tsoId && { id: Number(tsoId) }) },
                    include: { assignedBdm: true, territory: true, checkIns: { include: { shop: true } } }
                });
                data = tsos.map((t) => {
                    // Count unique shops checked in by this TSO (assuming checkin implies addition for this report)
                    const uniqueShops = new Set(t.checkIns.map((c) => c.shopId));
                    return {
                        id: t.id, tsoName: t.name, bdmName: t.assignedBdm?.name || 'N/A',
                        territory: t.territory?.name, area: 'Multiple', totalShopsAdded: uniqueShops.size
                    };
                }).filter((t) => t.totalShopsAdded > 0);
                break;
            case 'survey':
            case 'survey-detail':
                data = await prisma_1.prisma.surveyResponse.findMany({
                    where: {
                        startedAt: dateFilter,
                        ...(tsoId && { userId: Number(tsoId) }),
                        ...(shopId && { shopId: Number(shopId) }),
                        ...(status && { status: String(status) })
                    },
                    include: { shop: { include: { territory: true } }, user: { include: { assignedBdm: true } }, answers: { include: { question: { include: { section: true } } } } },
                    orderBy: { startedAt: 'desc' }
                });
                data = data.map((r) => ({
                    id: r.id, shopName: r.shop?.name, tsoName: r.user?.name, territory: r.shop?.territory?.name,
                    area: r.shop?.area, bdm: r.user?.assignedBdm?.name || 'N/A', surveyDate: r.completedAt || r.startedAt,
                    status: r.status, answers: r.answers // Included for details
                }));
                break;
            case 'territory-wise':
                const terrs = await prisma_1.prisma.territory.findMany({
                    include: { shops: { include: { responses: { where: { status: 'completed' } } } }, users: { where: { role: { name: 'TSO' } } } }
                });
                data = terrs.map((t) => ({
                    id: t.id, territory: t.name, totalSurveys: t.shops.reduce((sum, shop) => sum + shop.responses.length, 0),
                    noOfTsos: t.users.length, responsibleBdm: 'Multiple' // Simplify for now
                })).sort((a, b) => b.totalSurveys - a.totalSurveys);
                break;
            case 'area-wise':
                const areasRaw = await prisma_1.prisma.shop.findMany({
                    where: { area: { not: null } },
                    include: { territory: true, responses: { where: { status: 'completed' } } }
                });
                const aMap = {};
                areasRaw.forEach((s) => {
                    if (!aMap[s.area])
                        aMap[s.area] = { area: s.area, territory: s.territory?.name, totalSurveys: 0, activeTsos: new Set() };
                    aMap[s.area].totalSurveys += s.responses.length;
                    s.responses.forEach((r) => aMap[s.area].activeTsos.add(r.userId));
                });
                data = Object.values(aMap).map((a) => ({ ...a, activeTsos: a.activeTsos.size }));
                break;
            case 'tso-performance':
                const tsoPerf = await prisma_1.prisma.user.findMany({
                    where: { role: { name: 'TSO' } },
                    include: { assignedBdm: true, territory: true, responses: { where: { status: 'completed' } }, checkIns: true }
                });
                data = tsoPerf.map((t) => ({
                    id: t.id, tsoName: t.name, bdm: t.assignedBdm?.name || 'N/A', territory: t.territory?.name,
                    totalSurveys: t.responses.length, totalShopsAdded: new Set(t.checkIns.map((c) => c.shopId)).size
                }));
                break;
            case 'bdm-performance':
                const bdms = await prisma_1.prisma.user.findMany({
                    where: { assignedTsos: { some: {} } },
                    include: { assignedTsos: { include: { responses: { where: { status: 'completed' } }, checkIns: true } } }
                });
                data = bdms.map((b) => {
                    const totalSurveys = b.assignedTsos.reduce((sum, tso) => sum + tso.responses.length, 0);
                    const allShopIds = new Set();
                    b.assignedTsos.forEach((tso) => tso.checkIns.forEach((c) => allShopIds.add(c.shopId)));
                    return { id: b.id, bdmName: b.name, totalTsos: b.assignedTsos.length, totalSurveys, totalShopsAdded: allShopIds.size };
                });
                break;
            case 'daily-survey':
                const dailyResp = await prisma_1.prisma.surveyResponse.findMany({ where: { status: 'completed' } });
                const dMap = {};
                dailyResp.forEach((r) => {
                    const d = r.completedAt ? new Date(r.completedAt).toLocaleDateString() : new Date(r.startedAt).toLocaleDateString();
                    if (!dMap[d])
                        dMap[d] = { date: d, surveys: 0, tsos: new Set() };
                    dMap[d].surveys++;
                    dMap[d].tsos.add(r.userId);
                });
                data = Object.values(dMap).map((d) => ({ date: d.date, surveysDone: d.surveys, activeTsos: d.tsos.size, shopsAdded: 0 })); // simplified shops
                break;
            case 'comparison':
                const compSurveys = await prisma_1.prisma.surveyResponse.findMany({
                    where: { status: 'completed' },
                    include: { shop: { include: { territory: true } }, user: true, answers: { include: { question: true } } }
                });
                data = compSurveys.map((r) => {
                    const flattened = {
                        surveyId: r.id,
                        shopName: r.shop?.name,
                        territory: r.shop?.territory?.name,
                        city: r.shop?.city,
                        area: r.shop?.area,
                        date: r.completedAt
                    };
                    r.answers.forEach((a) => {
                        flattened[a.question.questionText] = a.value;
                    });
                    return flattened;
                });
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid report type' });
        }
        res.json({ success: true, data, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// 4. Management Advanced Dashboard (FCR #6)
router.get('/management/dashboard', async (req, res) => {
    try {
        const totalSurveys = await prisma_1.prisma.surveyResponse.count({ where: { status: 'completed' } });
        const totalShops = await prisma_1.prisma.shop.count();
        // Brand & Product stats from SurveyAnswers
        const answers = await prisma_1.prisma.surveyAnswer.findMany({
            where: { response: { status: 'completed' } },
            include: { question: true }
        });
        const brandMap = {};
        const productMap = {};
        const distributorMap = {};
        answers.forEach(a => {
            const qText = a.question.questionText.toLowerCase();
            if (qText.includes('brand') && a.value) {
                brandMap[a.value] = (brandMap[a.value] || 0) + 1;
            }
            else if ((qText.includes('product') || qText.includes('model')) && a.value) {
                productMap[a.value] = (productMap[a.value] || 0) + 1;
            }
            else if (qText.includes('distributor') && a.value) {
                distributorMap[a.value] = (distributorMap[a.value] || 0) + 1;
            }
        });
        res.json({
            success: true,
            data: {
                kpis: { totalSurveys, totalShops },
                brandStats: Object.keys(brandMap).map(k => ({ name: k, count: brandMap[k] })),
                productStats: Object.keys(productMap).map(k => ({ name: k, count: productMap[k] })),
                distributorStats: Object.keys(distributorMap).map(k => ({ name: k, count: distributorMap[k] }))
            },
            errors: null
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// 5. Dynamic Comparison Engine (FCR #5)
router.post('/management/comparison', async (req, res) => {
    try {
        const { groupBy, filters } = req.body;
        // Fetch all completed surveys with answers and shops
        const surveys = await prisma_1.prisma.surveyResponse.findMany({
            where: { status: 'completed' },
            include: { shop: { include: { territory: true } }, answers: { include: { question: true } } }
        });
        // Flatten
        let flattened = surveys.map(r => {
            const flat = { id: r.id, territory: r.shop?.territory?.name, city: r.shop?.city, date: r.completedAt || r.startedAt };
            r.answers.forEach(a => {
                flat[a.question.questionText] = a.value;
            });
            return flat;
        });
        // Apply filters loosely
        if (filters && typeof filters === 'object') {
            flattened = flattened.filter(f => {
                for (const key of Object.keys(filters)) {
                    if (f[key] !== filters[key])
                        return false;
                }
                return true;
            });
        }
        // Group by
        const grouped = {};
        // Helper to get ISO week string
        const getWeek = (date) => {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
            return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
        };
        flattened.forEach(f => {
            let key = f[groupBy];
            if (groupBy === 'week' && f.date) {
                key = getWeek(new Date(f.date));
            }
            else if (groupBy === 'month' && f.date) {
                const d = new Date(f.date);
                key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            }
            else if (!key) {
                key = 'Unknown';
            }
            grouped[key] = (grouped[key] || 0) + 1;
        });
        const data = Object.keys(grouped).map(k => ({ [groupBy]: k, count: grouped[k] })).sort((a, b) => a[groupBy].localeCompare(b[groupBy]));
        res.json({ success: true, data, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map