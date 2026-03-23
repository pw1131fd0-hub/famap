import { Router } from 'express';
import { LocationController } from '../controllers/locationController.js';
import { ReviewController } from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Get nearby locations
 *     description: Fetch locations within a specified radius from coordinates
 *     tags:
 *       - Locations
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitude coordinate
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitude coordinate
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         description: Search radius in kilometers
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [park, nursing_room, restaurant, medical]
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of nearby locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 *       400:
 *         description: Invalid parameters
 */
router.get('/', LocationController.getNearby);

/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Get location details
 *     description: Retrieve detailed information about a specific location
 *     tags:
 *       - Locations
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Location details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       404:
 *         description: Location not found
 */
router.get('/:id', LocationController.getById);

/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Create a new location
 *     description: Submit a new family-friendly location for review
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address, coordinates, category]
 *             properties:
 *               name:
 *                 type: object
 *                 properties:
 *                   zh:
 *                     type: string
 *                   en:
 *                     type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   zh:
 *                     type: string
 *                   en:
 *                     type: string
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Location created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, LocationController.create);

/**
 * @swagger
 * /api/locations/{id}:
 *   patch:
 *     summary: Update location details
 *     description: Update information about an existing location
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Location updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Location not found
 */
router.patch('/:id', authMiddleware, LocationController.update);

/**
 * @swagger
 * /api/locations/{id}/reviews:
 *   get:
 *     summary: Get location reviews
 *     description: Retrieve user reviews and ratings for a location
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router.get('/:id/reviews', ReviewController.getReviews);

/**
 * @swagger
 * /api/locations/{id}/reviews:
 *   post:
 *     summary: Create a review
 *     description: Submit a review and rating for a location
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Review created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/reviews', authMiddleware, ReviewController.createReview);

export default router;