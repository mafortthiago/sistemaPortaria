import dotenv from "dotenv";
import { sequelize } from "./database/database";
import app from "./app";
import { createDatabaseIfNotExists } from "./database/createDatabase";

// Carrega variáveis de ambiente
dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await createDatabaseIfNotExists();
        await sequelize.authenticate();
        console.log("🟢 Conectado ao banco de dados.");

        await sequelize.sync({ force: false });
        console.log("📦 Tabelas sincronizadas.");

        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Erro ao iniciar servidor:", err);
        process.exit(1);
    }
}

startServer();
