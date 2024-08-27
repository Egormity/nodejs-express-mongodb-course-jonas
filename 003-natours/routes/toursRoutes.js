const express = require('express');
// prettier-ignore
const { checkId, checkBody, createTour, getAllTours, getTour, updateTour, deleteTour, } = require('../controllers/tourController');

const router = express.Router();

router.param('id', checkId);

router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
