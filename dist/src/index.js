"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const users_route_js_1 = __importDefault(require("./routes/users.route.js"));
const listings_route_js_1 = __importDefault(require("./routes/listings.route.js"));
const bookings_route_js_1 = __importDefault(require("./routes/bookings.route.js"));
const auth_route_js_1 = __importDefault(require("./routes/auth.route.js"));
const auth_middleware_js_1 = require("./middlewares/auth.middleware.js");
const upload_route_js_1 = __importDefault(require("./routes/upload.route.js"));
const swagger_js_1 = require("./config/swagger.js");
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 10000;
app.use(express_1.default.json());
app.use("/auth", auth_route_js_1.default);
app.use('/users', auth_middleware_js_1.authentication, users_route_js_1.default);
app.use('/listings', auth_middleware_js_1.authentication, listings_route_js_1.default);
app.use('/bookings', auth_middleware_js_1.authentication, bookings_route_js_1.default);
app.use("/users", upload_route_js_1.default);
app.get('/', (req, res) => {
    res.json({ message: 'Express server running! Visit /api/users, /api/listings or /api/bookings' });
});
(0, swagger_js_1.setupSwagger)(app);
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=index.js.map