import { Lote } from "../models/Lote";

export class LoteService {
    async createLote(loteData: Partial<Lote>): Promise<Lote> {
        console.log(loteData);
        return await Lote.create(loteData);
    }
}
