"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// --- SHOPS ---
router.get('/shops', async (req, res) => {
    try {
        const shops = await prisma_1.prisma.shop.findMany({
            include: { territory: true }
        });
        res.json({ success: true, message: 'Shops retrieved', data: shops, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/shops', async (req, res) => {
    try {
        const { name, ownerName, contactNo, address, city, area, type, classification, territoryId, latitude, longitude } = req.body;
        const shop = await prisma_1.prisma.shop.create({
            data: { name, ownerName, contactNo, address, city, area, type, classification, territoryId: parseInt(territoryId) || 1, latitude, longitude }
        });
        res.json({ success: true, message: 'Shop created', data: shop, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.put('/shops/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const shop = await prisma_1.prisma.shop.update({
            where: { id: parseInt(id) },
            data: req.body
        });
        res.json({ success: true, message: 'Shop updated', data: shop, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.delete('/shops/:id', async (req, res) => {
    try {
        const shopId = parseInt(req.params.id);
        const responses = await prisma_1.prisma.surveyResponse.findMany({ where: { shopId }, select: { id: true } });
        const responseIds = responses.map((r) => r.id);
        // Delete related records manually to resolve foreign key constraints without DB migration
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.checkIn.deleteMany({ where: { shopId } }),
            prisma_1.prisma.surveyAnswer.deleteMany({ where: { responseId: { in: responseIds } } }),
            prisma_1.prisma.surveyResponse.deleteMany({ where: { shopId } }),
            prisma_1.prisma.shop.delete({ where: { id: shopId } })
        ]);
        res.json({ success: true, message: 'Shop deleted', data: null, errors: null });
    }
    catch (error) {
        console.error(error);
        if (error.code === 'P2003') {
            return res.status(400).json({ success: false, message: 'Cannot delete shop because it is referenced in check-ins or surveys', data: null, errors: ['foreign_key_constraint'] });
        }
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/shops/bulk', async (req, res) => {
    try {
        const shops = req.body.shops;
        if (!Array.isArray(shops)) {
            return res.status(400).json({ success: false, message: 'Invalid data format', data: null, errors: ['invalid_format'] });
        }
        const createdShops = await prisma_1.prisma.$transaction(shops.map((s) => prisma_1.prisma.shop.create({
            data: {
                name: s.name,
                ownerName: s.ownerName || null,
                city: s.city || null,
                area: s.area || null,
                type: s.type || null,
                classification: s.classification || null,
                territoryId: s.territoryId ? parseInt(s.territoryId) : 1
            }
        })));
        res.json({ success: true, message: `${createdShops.length} shops imported`, data: createdShops, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error during import', data: null, errors: ['server_error'] });
    }
});
// --- PRODUCTS ---
router.get('/products', async (req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany();
        res.json({ success: true, message: 'Products retrieved', data: products, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/products', async (req, res) => {
    try {
        const { name, category, price, isActive, brand, model, warranty } = req.body;
        const product = await prisma_1.prisma.product.create({
            data: { name, category, price, isActive, brand, model, warranty }
        });
        res.json({ success: true, message: 'Product created', data: product, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/products/bulk', async (req, res) => {
    try {
        const products = req.body.products;
        if (!Array.isArray(products)) {
            return res.status(400).json({ success: false, message: 'Invalid data format', data: null, errors: ['invalid_format'] });
        }
        const createdProducts = await prisma_1.prisma.$transaction(products.map((p) => prisma_1.prisma.product.create({
            data: {
                name: p.name,
                category: p.category || 'Hardware',
                price: parseFloat(p.price) || 0,
                isActive: p.isActive !== undefined ? p.isActive : true,
                brand: p.brand || null,
                model: p.model || null,
                warranty: p.warranty || null
            }
        })));
        res.json({ success: true, message: `${createdProducts.length} products imported`, data: createdProducts, errors: null });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error during import', data: null, errors: ['server_error'] });
    }
});
router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma_1.prisma.product.update({
            where: { id: parseInt(id) },
            data: req.body
        });
        res.json({ success: true, message: 'Product updated', data: product, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
// --- BRAND WISE PRODUCT MAPPING ---
router.get('/mappings/categories', async (req, res) => {
    try {
        const categories = await prisma_1.prisma.productCategory.findMany();
        res.json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/mappings/categories', async (req, res) => {
    try {
        const category = await prisma_1.prisma.productCategory.create({ data: { name: req.body.name } });
        res.json({ success: true, data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/mappings/brands', async (req, res) => {
    try {
        const brands = await prisma_1.prisma.productBrand.findMany({ include: { mappings: true } });
        res.json({ success: true, data: brands });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/mappings/brands', async (req, res) => {
    try {
        const brand = await prisma_1.prisma.productBrand.create({ data: { name: req.body.name } });
        res.json({ success: true, data: brand });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/mappings/link', async (req, res) => {
    try {
        const { brandId, products } = req.body;
        // Clear old mappings
        await prisma_1.prisma.productMapping.deleteMany({ where: { brandId: parseInt(brandId) } });
        // Add new mappings
        const mappings = await prisma_1.prisma.$transaction(products.map((p) => prisma_1.prisma.productMapping.create({
            data: { brandId: parseInt(brandId), productName: p }
        })));
        res.json({ success: true, data: mappings });
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
            include: { role: true, territory: true }
        });
        res.json({ success: true, message: 'Users retrieved', data: users, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/users', async (req, res) => {
    try {
        const { name, email, password, roleId, territoryId, employeeId, mobileNumber, designation, department, cnic, deviceImei, deviceType, status, assignedBdmId, dashboardAccess, reportAccess, modulePermissions, menuPermissions, exportPermission, regionAccess, territoryAccess } = req.body;
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password || 'password123', 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                roleId: parseInt(roleId),
                territoryId: territoryId ? parseInt(territoryId) : null,
                employeeId,
                mobileNumber,
                designation,
                department,
                cnic,
                deviceImei,
                deviceType,
                status: status || 'Active',
                assignedBdmId: assignedBdmId ? parseInt(assignedBdmId) : null,
                dashboardAccess: !!dashboardAccess,
                reportAccess: !!reportAccess,
                modulePermissions: modulePermissions ? JSON.stringify(modulePermissions) : null,
                menuPermissions: menuPermissions ? JSON.stringify(menuPermissions) : null,
                exportPermission: !!exportPermission,
                regionAccess: regionAccess ? JSON.stringify(regionAccess) : null,
                territoryAccess: territoryAccess ? JSON.stringify(territoryAccess) : null
            }
        });
        res.json({ success: true, message: 'User created', data: user, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, roleId, territoryId, employeeId, mobileNumber, designation, department, cnic, deviceImei, deviceType, status, assignedBdmId, dashboardAccess, reportAccess, modulePermissions, menuPermissions, exportPermission, regionAccess, territoryAccess } = req.body;
        const updateData = {
            name,
            email,
            roleId: parseInt(roleId),
            territoryId: territoryId ? parseInt(territoryId) : null,
            employeeId,
            mobileNumber,
            designation,
            department,
            cnic,
            deviceImei,
            deviceType,
            status: status || 'Active',
            assignedBdmId: assignedBdmId ? parseInt(assignedBdmId) : null,
            dashboardAccess: !!dashboardAccess,
            reportAccess: !!reportAccess,
            modulePermissions: modulePermissions ? JSON.stringify(modulePermissions) : null,
            menuPermissions: menuPermissions ? JSON.stringify(menuPermissions) : null,
            exportPermission: !!exportPermission,
            regionAccess: regionAccess ? JSON.stringify(regionAccess) : null,
            territoryAccess: territoryAccess ? JSON.stringify(territoryAccess) : null
        };
        if (password) {
            const bcrypt = require('bcryptjs');
            updateData.password = await bcrypt.hash(password, 10);
        }
        const user = await prisma_1.prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData
        });
        res.json({ success: true, message: 'User updated', data: user, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.put('/users/:id/territory', async (req, res) => {
    try {
        const { territoryId } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: parseInt(req.params.id) },
            data: { territoryId: territoryId ? parseInt(territoryId) : null }
        });
        res.json({ success: true, message: 'Territory assigned', data: user, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.put('/users/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json({ success: true, message: 'Status updated', data: user, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.delete('/users/:id', async (req, res) => {
    try {
        await prisma_1.prisma.user.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true, message: 'User deleted', data: null, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
// --- ROLES ---
router.get('/roles', async (req, res) => {
    try {
        const roles = await prisma_1.prisma.role.findMany();
        res.json({ success: true, message: 'Roles retrieved', data: roles, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/roles', async (req, res) => {
    try {
        const { name, permissions } = req.body;
        const role = await prisma_1.prisma.role.create({
            data: { name, permissions: JSON.stringify(permissions) }
        });
        res.json({ success: true, message: 'Role created', data: role, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.put('/roles/:id', async (req, res) => {
    try {
        const { name, permissions } = req.body;
        const role = await prisma_1.prisma.role.update({
            where: { id: parseInt(req.params.id) },
            data: { name, permissions: JSON.stringify(permissions) }
        });
        res.json({ success: true, message: 'Role updated', data: role, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
// --- TERRITORIES ---
router.get('/territories', async (req, res) => {
    try {
        const territories = await prisma_1.prisma.territory.findMany({
            include: { users: true, shops: true }
        });
        res.json({ success: true, message: 'Territories retrieved', data: territories, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/territories', async (req, res) => {
    try {
        const { name, region } = req.body;
        const territory = await prisma_1.prisma.territory.create({
            data: { name, region }
        });
        res.json({ success: true, message: 'Territory created', data: territory, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.delete('/territories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Disconnect shops and users first (set to null if optional, or they might block deletion)
        // Actually Prisma handles relations if we configured cascading, but let's just delete the territory.
        // Wait, users and shops have territoryId. If they are required, it will fail.
        // shops have territoryId Int (required). Users have territoryId Int? (optional).
        // Let's set shops' territoryId to 1 (default) or handle it gracefully.
        // For now, let's just try to delete the territory. If it fails due to foreign key constraints, we'll return an error.
        await prisma_1.prisma.territory.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Territory deleted', data: null, errors: null });
    }
    catch (error) {
        console.error(error);
        if (error.code === 'P2003') {
            return res.status(400).json({ success: false, message: 'Cannot delete territory because it has assigned users or shops', data: null, errors: ['foreign_key_constraint'] });
        }
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
// --- REGIONS & CITIES ---
router.get('/regions', async (req, res) => {
    try {
        const regions = await prisma_1.prisma.region.findMany({ include: { cities: true } });
        res.json({ success: true, message: 'Regions retrieved', data: regions, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/regions', async (req, res) => {
    try {
        const { name } = req.body;
        const region = await prisma_1.prisma.region.create({ data: { name } });
        res.json({ success: true, message: 'Region created', data: region, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.delete('/regions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.region.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Region deleted', data: null, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.get('/cities', async (req, res) => {
    try {
        const cities = await prisma_1.prisma.city.findMany({ include: { region: true, areas: true } });
        res.json({ success: true, message: 'Cities retrieved', data: cities, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/cities', async (req, res) => {
    try {
        const { name, regionId } = req.body;
        const city = await prisma_1.prisma.city.create({
            data: { name, regionId: parseInt(regionId) },
            include: { region: true }
        });
        res.json({ success: true, message: 'City created', data: city, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/cities/bulk', async (req, res) => {
    try {
        const { cities } = req.body;
        if (!cities || !Array.isArray(cities)) {
            return res.status(400).json({ success: false, message: 'Invalid data format' });
        }
        const createdCities = await Promise.all(cities.map(async (c) => {
            let regionId = c.regionId;
            if (!regionId) {
                // Find region by name if regionId not provided
                if (c.region) {
                    const region = await prisma_1.prisma.region.findFirst({ where: { name: c.region } });
                    if (region)
                        regionId = region.id;
                }
            }
            if (!regionId)
                return null; // Skip if no region
            return await prisma_1.prisma.city.create({
                data: { name: c.name, regionId: parseInt(regionId) },
                include: { region: true }
            });
        }));
        const validCities = createdCities.filter(c => c !== null);
        res.json({ success: true, message: `${validCities.length} cities created`, data: validCities, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.delete('/cities/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.city.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'City deleted', data: null, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.get('/areas', async (req, res) => {
    try {
        const areas = await prisma_1.prisma.area.findMany({ include: { city: true } });
        res.json({ success: true, message: 'Areas retrieved', data: areas, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/areas', async (req, res) => {
    try {
        const { name, cityId } = req.body;
        const area = await prisma_1.prisma.area.create({
            data: { name, cityId: parseInt(cityId) },
            include: { city: true }
        });
        res.json({ success: true, message: 'Area created', data: area, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/areas/bulk', async (req, res) => {
    try {
        const { areas } = req.body;
        if (!areas || !Array.isArray(areas)) {
            return res.status(400).json({ success: false, message: 'Invalid data format' });
        }
        const createdAreas = await Promise.all(areas.map(async (a) => {
            let cityId = a.cityId;
            if (!cityId) {
                // Find city by name if cityId not provided
                if (a.city) {
                    const city = await prisma_1.prisma.city.findFirst({ where: { name: a.city } });
                    if (city)
                        cityId = city.id;
                }
            }
            if (!cityId)
                return null; // Skip if no city
            return await prisma_1.prisma.area.create({
                data: { name: a.name, cityId: parseInt(cityId) },
                include: { city: true }
            });
        }));
        const validAreas = createdAreas.filter(a => a !== null);
        res.json({ success: true, message: `${validAreas.length} areas created`, data: validAreas, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.delete('/areas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.area.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Area deleted', data: null, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
// --- COMPETITORS ---
router.get('/competitors', async (req, res) => {
    try {
        const competitors = await prisma_1.prisma.competitor.findMany();
        res.json({ success: true, message: 'Competitors retrieved', data: competitors, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/competitors', async (req, res) => {
    try {
        const { name, marketShare } = req.body;
        const competitor = await prisma_1.prisma.competitor.create({
            data: { name, marketShare: parseFloat(marketShare) }
        });
        res.json({ success: true, message: 'Competitor created', data: competitor, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
// --- SUPPORT TICKETS ---
router.get('/tickets', async (req, res) => {
    try {
        const userRole = req.user.role;
        let whereClause = {};
        if (userRole && userRole.toLowerCase() === 'tso') {
            const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.userId } });
            if (user && user.email) {
                whereClause = { email: user.email };
            }
        }
        const tickets = await prisma_1.prisma.supportTicket.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, message: 'Tickets retrieved', data: tickets, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/tickets', async (req, res) => {
    try {
        const { subject, message, photo, name, email, status, priority } = req.body;
        const ticket = await prisma_1.prisma.supportTicket.create({
            data: { subject, message, photo, name, email, status: status || 'Open', priority: priority || 'Medium' }
        });
        res.json({ success: true, message: 'Ticket created', data: ticket, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.put('/tickets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await prisma_1.prisma.supportTicket.update({
            where: { id: parseInt(id) },
            data: req.body
        });
        res.json({ success: true, message: 'Ticket updated', data: ticket, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
// --- TRADE PROGRAMS ---
router.get('/programs', async (req, res) => {
    try {
        const programs = await prisma_1.prisma.tradeProgram.findMany();
        res.json({ success: true, message: 'Programs retrieved', data: programs, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/programs', async (req, res) => {
    try {
        const { title, description, status, budget } = req.body;
        const program = await prisma_1.prisma.tradeProgram.create({
            data: { title, description, status, budget: budget ? parseFloat(budget) : null }
        });
        res.json({ success: true, message: 'Program created', data: program, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
// --- PRICING HISTORY ---
router.get('/pricing', async (req, res) => {
    try {
        const pricing = await prisma_1.prisma.priceHistory.findMany();
        res.json({ success: true, message: 'Pricing retrieved', data: pricing, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/pricing', async (req, res) => {
    try {
        const { productId, oldPrice, newPrice } = req.body;
        const pricing = await prisma_1.prisma.priceHistory.create({
            data: { productId: parseInt(productId), oldPrice: parseFloat(oldPrice), newPrice: parseFloat(newPrice) }
        });
        res.json({ success: true, message: 'Pricing created', data: pricing, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
// --- NOTIFICATIONS ---
router.get('/notifications', async (req, res) => {
    try {
        const notifications = await prisma_1.prisma.notification.findMany();
        res.json({ success: true, message: 'Notifications retrieved', data: notifications, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/notifications', async (req, res) => {
    try {
        const { title, message, audience, type, pushNotification } = req.body;
        const notif = await prisma_1.prisma.notification.create({
            data: { title, message, audience, type, pushNotification: pushNotification || false }
        });
        // Create UserNotification entries for the targeted audience
        let targetUsers = [];
        if (audience === 'All Users' || !audience) {
            targetUsers = await prisma_1.prisma.user.findMany({ select: { id: true } });
        }
        else {
            // Attempt to find by Role name
            const role = await prisma_1.prisma.role.findFirst({ where: { name: audience } });
            if (role) {
                targetUsers = await prisma_1.prisma.user.findMany({ where: { roleId: role.id }, select: { id: true } });
            }
            else {
                // Fallback: just send to all users if audience doesn't match a specific role
                targetUsers = await prisma_1.prisma.user.findMany({ select: { id: true } });
            }
        }
        if (targetUsers.length > 0) {
            const userNotificationsData = targetUsers.map((user) => ({
                userId: user.id,
                notificationId: notif.id
            }));
            await prisma_1.prisma.userNotification.createMany({
                data: userNotificationsData
            });
        }
        res.json({ success: true, message: 'Notification sent', data: notif, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.put('/notifications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const notif = await prisma_1.prisma.notification.update({
            where: { id: parseInt(id) },
            data: req.body
        });
        res.json({ success: true, message: 'Notification updated', data: notif, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.delete('/notifications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.notification.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Notification deleted', data: null, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
// --- SYSTEM SETTINGS ---
router.get('/settings', async (req, res) => {
    try {
        const settings = await prisma_1.prisma.systemSetting.findMany();
        res.json({ success: true, message: 'Settings retrieved', data: settings, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
router.post('/settings', async (req, res) => {
    try {
        const updates = req.body; // Expecting array or object
        // Assuming simple loop for multiple
        for (const key of Object.keys(updates)) {
            await prisma_1.prisma.systemSetting.upsert({
                where: { key },
                update: { value: updates[key].toString() },
                create: { key, value: updates[key].toString() }
            });
        }
        res.json({ success: true, message: 'Settings updated', data: null, errors: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', data: null, errors: ['server_error'] });
    }
});
exports.default = router;
//# sourceMappingURL=master.routes.js.map