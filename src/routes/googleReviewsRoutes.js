import { Router } from 'express';
import ReviewController from '../controllers/oogleReviewsController.js';

const router = Router();

router.get('/reviews', ReviewController.fetchReviews);

export default router;
