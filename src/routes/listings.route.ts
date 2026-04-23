import { Router } from 'express';
import * as listingController from '../controllers/listings.controller.js';

const router = Router();

router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListingById);
router.post('/', listingController.createListing);
router.put('/:id', listingController.updateListing);
router.delete('/:id', listingController.deleteListing);

export default router;

