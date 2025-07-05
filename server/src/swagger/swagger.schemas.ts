// Swagger schema definitions
/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - businessName,
 *         - ownerName,
 *         - email,
 *         - password,
 *         - phone,
 *         - address,
 *         - serviceArea,
 *       properties:
 *         businessName:
 *           type: string
 *         ownerName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         phone:
 *           type: string
 *         address:
 *           type: {street, city, state, zipCode, country}
 *         serviceArea:
 *           type: string[]
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 */
