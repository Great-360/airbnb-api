import type { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
export declare function uploadAvatar(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteAvatar(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function uploadListingPhotos(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteListingPhoto(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=upload.controller.d.ts.map