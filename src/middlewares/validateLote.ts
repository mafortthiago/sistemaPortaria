import { Request, Response, NextFunction } from "express";

export const validateLote = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { nome, ativo } = req.body;

    if (!nome || typeof nome !== "string") {
        return res
            .status(400)
            .json({ error: "Nome inválido ou não informado." });
    }

    if (ativo !== undefined && typeof ativo !== "boolean") {
        return res
            .status(400)
            .json({ error: "Ativo deve ser um valor booleano." });
    }

    next();
};
