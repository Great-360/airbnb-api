/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
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
 *         role:
 *           type: string
 *           enum: [HOST, GUEST]
 *           example: HOST
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: https://res.cloudinary.com/demo/image/upload/avatar.jpg
 *         bio:
 *           type: string
 *           nullable: true
 *           example: Travel enthusiast and foodie
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: '2024-01-15T10:30:00Z'
 *     UpdateUserInput:
 *       type: object
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
 *         role:
 *           type: string
 *           enum: [HOST, GUEST]
 *           example: HOST
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: https://res.cloudinary.com/demo/image/upload/avatar.jpg
 *         bio:
 *           type: string
 *           nullable: true
 *           example: Travel enthusiast and foodie
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=users.route.d.ts.map