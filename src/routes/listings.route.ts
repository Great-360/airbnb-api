import { Router } from 'express';
import * as listingController from '../controllers/listings.controller.js';
import { authentication, requireHost } from '../middlewares/auth.middleware.js';
import upload from '../config/multer.js';
import { uploadListingPhotos, deleteListingPhoto } from '../controllers/upload.controller.js';

const router = Router();

router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListingById);
router.post('/', authentication, requireHost, listingController.createListing);
router.put('/:id', authentication, listingController.updateListing);
router.delete('/:id', authentication, listingController.deleteListing);
router.post('/:id/photos', authentication, upload.array('photos', 5), uploadListingPhotos);
router.delete('/:id/photos/:photoId', authentication, deleteListingPhoto);

export default router;

