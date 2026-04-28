import { Router } from "express";
import upload from "../config/multer.js";
import { uploadAvatar, deleteAvatar, } from "../controllers/upload.controller.js";
import { authentication } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/:id/avatar", authentication, upload.single("image"), uploadAvatar);
router.delete("/:id/avatar", authentication, deleteAvatar);
export default router;
//# sourceMappingURL=upload.route.js.map