/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required: [name, email, username, phone, password, role]
 *       properties:
 *         name:
 *           type: string
 *           example: Jane Doe
 *         email:
 *           type: string
 *           example: jane@example.com
 *         username:
 *           type: string
 *           example: janedoe
 *         phone:
 *           type: string
 *           example: +1-555-123-4567
 *         password:
 *           type: string
 *           example: SecurePass123!
 *         role:
 *           type: string
 *           enum: [HOST, GUEST]
 *           example: GUEST
 *     LoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           example: jane@example.com
 *         password:
 *           type: string
 *           example: SecurePass123!
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           $ref: '#/components/schemas/User'
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Resource not found
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=auth.route.d.ts.map