import { Model, DataTypes } from "sequelize";
import { sequelize } from "./../database/database";
import Lote from "./Lote";

class Boleto extends Model {
    public id!: number;
    public nomeSacado!: string;
    public idLote!: number;
    public valor!: number;
    public linhaDigitavel!: string;
    public ativo!: boolean;
    public criadoEm!: Date;
}

Boleto.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: "id",
        },
        nomeSacado: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: "nome_sacado",
        },
        idLote: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "id_lote",
            references: {
                model: Lote,
                key: "id",
            },
        },
        valor: {
            type: DataTypes.DECIMAL,
            allowNull: false,
            field: "valor",
        },
        linhaDigitavel: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: "linha_digitavel",
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: "ativo",
        },
        criadoEm: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: "criado_em",
        },
    },
    {
        sequelize,
        tableName: "boletos",
        timestamps: false,
    }
);

Boleto.belongsTo(Lote, { foreignKey: "id_lote" });

export default Boleto;
