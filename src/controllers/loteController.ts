import { Request, Response } from "express";
import { LoteService } from "../services/loteService";

export class LoteController {
    private loteService: LoteService;

    constructor() {
        this.loteService = new LoteService();
        this.create = this.create.bind(this);
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            console.log(req.body);
            const novoLote = await this.loteService.createLote(req.body);
            return res.status(201).json(novoLote);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Erro ao criar lote." });
        }
    }
}
