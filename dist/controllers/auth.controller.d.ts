import { Response, Request } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
export declare function register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getMe(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function changePassword(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function forgotPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function resetPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.controller.d.ts.map