import {
  getAccounts,
  //   getReviews,
} from './../services/google/googleReviewsService.js';

const ReviewController = {
  async fetchReviews(req, res) {
    try {
      //   const reviews = await getReviews();
      const reviews = await getAccounts();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default ReviewController;
