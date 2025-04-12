import express from "express";
import multer from "multer";
import {
    obterBoletos,
    processarArquivo,
} from "../controllers/boletoController";
import { validarArquivo } from "../middlewares/fileMiddleware";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.post(
    "/importar",
    upload.single("file"),
    validarArquivo,
    processarArquivo
);

router.get("/", obterBoletos);

export default router;
