import { Router } from "express";
import { LoteController } from "../controllers/loteController";
import { validateLote } from "../middlewares/validateLote";

const router = Router();
const loteController = new LoteController();

router.post("/", validateLote, loteController.create);

export default router;
