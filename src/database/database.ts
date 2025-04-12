import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_NAME || "default_db_name",
    process.env.DB_USER || "default_db_user",
    process.env.DB_PASSWORD || "default_db_password",
    {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        dialect: "postgres",
    }
);
