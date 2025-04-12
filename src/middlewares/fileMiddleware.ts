import { Request, Response, NextFunction } from "express";

import path from "path";

export const validarArquivo = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const fileTypeFromBody = req.body?.fileType?.toLowerCase();
    const fileExtension = path
        .extname(req.file?.originalname || "")
        .toLowerCase()
        .replace(".", "");

    const fileType = fileTypeFromBody || fileExtension;

    if (!fileType || (fileType !== "pdf" && fileType !== "csv")) {
        return res
            .status(400)
            .send("Tipo de arquivo inválido. Use 'pdf' ou 'csv'.");
    }

    if (!req.file) {
        return res.status(400).send("Arquivo é obrigatório.");
    }

    next();
};
