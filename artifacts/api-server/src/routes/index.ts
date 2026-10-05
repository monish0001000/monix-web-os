import { Router, type IRouter } from "express";
import healthRouter from "./health";
import auraRouter from "./aura";
import commRouter from "./comm";
import proxyRouter from "./proxy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(auraRouter);
router.use(commRouter);
router.use(proxyRouter);

export default router;
