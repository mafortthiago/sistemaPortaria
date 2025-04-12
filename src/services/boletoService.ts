import fs from "fs";
import csvParser from "csv-parser";
import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import Boleto from "../models/Boleto";
import Lote from "../models/Lote";
import { Op } from "sequelize";

export const importarBoleto = async (filePath: string) => {
    const boletos = await processarCSV(filePath);
    await salvarBoletos(boletos);
};

const processarCSV = async (filePath: string): Promise<any[]> => {
    const boletos: any[] = [];
    const promises: Promise<void>[] = [];

    await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csvParser({ separator: ";" }))
            .on("data", (row) => promises.push(processarLinha(row, boletos)))
            .on("end", async () => {
                await Promise.all(promises);
                resolve();
            })
            .on("error", reject);
    });

    console.log("Boletos processados:", boletos);
    return boletos;
};

const verificarBoletoExistente = async (
    linhaDigitavel: string,
    nomeSacado: string,
    valor: number
): Promise<boolean> => {
    const boleto = await Boleto.findOne({
        where: {
            [Op.or]: [
                { linhaDigitavel },
                {
                    [Op.and]: [{ nomeSacado }, { valor }],
                },
            ],
        },
    });

    return !!boleto;
};

const processarLinha = async (row: any, boletos: any[]): Promise<void> => {
    const { nome, unidade, valor, linha_digitavel } = row;
    const lote = await buscarLote(unidade);

    if (lote) {
        const valorNumerico = parseFloat(valor);
        const boletoExiste = await verificarBoletoExistente(
            linha_digitavel,
            nome,
            valorNumerico
        );

        if (boletoExiste) {
            const erro = `Boleto já existente para ${nome} com linha digitável ${linha_digitavel}. Ignorando.`;
            console.log(erro);
        }

        boletos.push(criarBoleto(nome, lote.id, valor, linha_digitavel));
    } else {
        console.log(
            "Lote não encontrado para a unidade:",
            (unidade || "").padStart(4, "0")
        );
    }
};

const buscarLote = async (unidade: string | undefined) => {
    if (!unidade) return null;
    return await Lote.findOne({ where: { nome: unidade.padStart(4, "0") } });
};

const criarBoleto = (
    nome: string,
    idLote: number,
    valor: string,
    linhaDigitavel: string
) => ({
    nomeSacado: nome,
    idLote,
    valor: parseFloat(valor),
    linhaDigitavel,
    ativo: true,
    criadoEm: new Date(),
});

const salvarBoletos = async (boletos: any[]) => {
    if (boletos.length > 0) {
        await Boleto.bulkCreate(boletos);
        console.log("Boletos inseridos com sucesso.");
    } else {
        console.log("Nenhum boleto foi inserido.");
    }
};

export const processarPDF = async (pdfPath: string, outputDir: string) => {
    const boletos = await Boleto.findAll();

    const ordemFixa = ["MARCIA CARVALHO", "JOSE DA SILVA", "MARCOS ROBERTO"];
    const boletosOrdenados = ordemFixa.map((nome) =>
        boletos.find((b) => b.nomeSacado === nome)
    );

    for (let i = 0; i < boletosOrdenados.length; i++) {
        const boleto = boletosOrdenados[i] || null;
        if (boleto) {
            await salvarPaginaPDF(boleto, i, outputDir);
        }
    }
};

const salvarPaginaPDF = async (
    boleto: any,
    index: number,
    outputDir: string
) => {
    const newPdf = await PDFDocument.create();
    const page = newPdf.addPage([612, 792]);

    const outputPath = boleto
        ? `${outputDir}/${boleto.id}.pdf`
        : `${outputDir}/pagina_${index + 1}.pdf`;

    if (boleto) {
        const { height } = page.getSize();
        page.drawText("Detalhes do Boleto:", {
            x: 50,
            y: height - 100,
            size: 14,
            color: rgb(0, 0, 0.8),
        });

        page.drawText(`ID: ${boleto.id}`, { x: 50, y: height - 130, size: 12 });
        page.drawText(`Nome do Sacado: ${boleto.nomeSacado}`, {
            x: 50,
            y: height - 150,
            size: 12,
        });
        page.drawText(`Lote: ${boleto.idLote}`, {
            x: 50,
            y: height - 170,
            size: 12,
        });

        let valorFormatado;
        if (typeof boleto.valor === "number" && !isNaN(boleto.valor)) {
            valorFormatado = boleto.valor.toFixed(2);
        } else {
            const valorNum = Number(boleto.valor);
            valorFormatado = isNaN(valorNum)
                ? boleto.valor
                : valorNum.toFixed(2);
        }

        page.drawText(`Valor: R$ ${valorFormatado}`, {
            x: 50,
            y: height - 190,
            size: 12,
        });

        page.drawText(`Linha Digitável: ${boleto.linhaDigitavel}`, {
            x: 50,
            y: height - 210,
            size: 12,
        });
    }

    const pdfBytesOut = await newPdf.save();
    fs.writeFileSync(outputPath, pdfBytesOut);
    console.log(`Página salva em: ${outputPath}`);
};

export const listarBoletos = async (filters: any) => {
    const where = construirFiltros(filters);
    const boletos = await Boleto.findAll({ where });
    return filters.relatorio ? gerarRelatorioPDF(boletos) : boletos;
};

const construirFiltros = (filters: any) => {
    const where: any = {};

    if (filters.nome) {
        where.nomeSacado = {
            [Op.like]: `%${filters.nome}%`,
        };
    }

    if (filters.valor_inicial && filters.valor_final) {
        where.valor = {
            [Op.between]: [
                Number(filters.valor_inicial),
                Number(filters.valor_final),
            ],
        };
    }

    if (filters.id_lote !== undefined) {
        where.idLote = Number(filters.id_lote);
    }

    return where;
};

const gerarRelatorioPDF = async (boletos: any[]) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    desenharCabecalhoRelatorio(page);
    desenharBoletosNoRelatorio(page, boletos);

    const pdfBytes = await pdfDoc.save();
    return { base64: Buffer.from(pdfBytes).toString("base64") };
};

const desenharCabecalhoRelatorio = (page: PDFPage) => {
    const { height } = page.getSize();
    page.drawText("Relatório de Boletos", { x: 50, y: height - 50, size: 18 });
};

const desenharBoletosNoRelatorio = (page: PDFPage, boletos: any[]) => {
    const { height } = page.getSize();
    let y = height - 80;

    boletos.forEach((boleto) => {
        const text = `ID: ${boleto.id} | Nome: ${boleto.nomeSacado} | Lote: ${boleto.idLote} | Valor: ${boleto.valor} | Linha Digitável: ${boleto.linhaDigitavel}`;
        page.drawText(text, { x: 50, y, size: 12 });
        y -= 20;
    });
};
