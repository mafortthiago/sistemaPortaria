import { Request, Response } from "express";
import {
    importarBoleto as serviceImportarBoleto,
    processarPDF,
    listarBoletos,
} from "../services/boletoService";
import path from "path";
import fs from "fs";

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

export const importarBoleto = async (req: MulterRequest) => {
    if (!req.file) {
        throw new Error("Arquivo CSV é obrigatório.");
    }

    const filePath = path.resolve(req.file.path);
    await serviceImportarBoleto(filePath);
    fs.unlinkSync(filePath);
};

export const processarArquivo = async (req: MulterRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).send("Arquivo é obrigatório.");
        }

        const filePath = path.resolve(req.file.path);
        const extension = path.extname(req.file.originalname).toLowerCase();

        if (extension === ".pdf") {
            await processarPDF(filePath, "outputs");
            fs.unlinkSync(filePath);
            return res.status(200).send("PDF processado com sucesso.");
        } else if (extension === ".csv") {
            await importarBoleto(req);
            return res.status(200).send("CSV processado com sucesso.");
        } else {
            fs.unlinkSync(filePath);
            return res.status(400).send("Tipo de arquivo não suportado.");
        }
    } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        return res.status(500).send("Erro ao processar o arquivo.");
    }
};

export const obterBoletos = async (req: Request, res: Response) => {
    try {
        const boletos = await listarBoletos(req.query);
        return res.status(200).json(boletos);
    } catch (error) {
        console.error("Erro ao listar boletos:", error);
        return res.status(500).send("Erro ao listar boletos.");
    }
};
