"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const master_routes_1 = __importDefault(require("./routes/master.routes"));
const survey_routes_1 = __importDefault(require("./routes/survey.routes"));
const checkin_routes_1 = __importDefault(require("./routes/checkin.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const executive_routes_1 = __importDefault(require("./routes/executive.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Debug logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    // Hook into response to log status code
    const originalSend = res.send;
    res.send = function (body) {
        console.log(`[RESPONSE SEND] ${req.originalUrl} -> ${res.statusCode}`);
        if (res.statusCode !== 200 && res.statusCode !== 201) {
            console.log(`[RESPONSE BODY]`, body);
        }
        return originalSend.call(this, body);
    };
    const originalEnd = res.end;
    res.end = function (chunk, encoding, cb) {
        console.log(`[RESPONSE END] ${req.originalUrl} -> ${res.statusCode}`);
        if (res.statusCode !== 200 && res.statusCode !== 201 && chunk) {
            console.log(`[RESPONSE CHUNK]`, chunk.toString());
        }
        return originalEnd.apply(this, arguments);
    };
    next();
});
// Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/master', master_routes_1.default);
app.use('/api/v1/surveys', survey_routes_1.default);
app.use('/api/v1/checkin', checkin_routes_1.default);
app.use('/api/v1/analytics', analytics_routes_1.default);
app.use('/api/v1/executive', executive_routes_1.default);
// Health Check
app.get('/api/v1/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', data: null, errors: null });
});
app.get('/api/v1/proxy-image', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url)
            return res.status(400).send('URL required');
        const axios = require('axios');
        const response = await axios.get(url, { responseType: 'stream' });
        res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
        response.data.pipe(res);
    }
    catch (err) {
        console.error('Proxy Error:', err.message);
        res.status(500).send('Proxy Error');
    }
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[GLOBAL ERROR HANDLER]', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Unknown Error',
        errors: [err.type || 'unknown']
    });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});
//# sourceMappingURL=index.js.map