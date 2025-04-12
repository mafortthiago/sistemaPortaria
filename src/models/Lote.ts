import { Model, DataTypes } from "sequelize";
import { sequelize } from "./../database/database";
export class Lote extends Model {
    public id!: number;
    public nome!: string;
    public ativo!: boolean;
    public criadoEm!: Date;
}

Lote.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: "id",
        },
        nome: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "nome",
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
        tableName: "lotes",
        timestamps: false,
    }
);

export default Lote;
