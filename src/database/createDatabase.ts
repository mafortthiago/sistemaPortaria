import { Client } from "pg";
import dotenv from "dotenv";
import format from "pg-format";

dotenv.config();

function validateRequiredEnvVars() {
    const requiredVars = [
        "DB_USER",
        "DB_PASSWORD",
        "DB_HOST",
        "DB_PORT",
        "DB_NAME",
    ];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(
            `Variáveis de ambiente obrigatórias não definidas: ${missingVars.join(
                ", "
            )}`
        );
    }
}

function validateDatabaseName(name: string): boolean {
    const validPattern = /^[a-zA-Z0-9_]+$/;
    if (!validPattern.test(name)) {
        throw new Error(
            `Nome de banco de dados inválido: ${name}. Use apenas letras, números e sublinhados.`
        );
    }
    return true;
}

export async function createDatabaseIfNotExists() {
    try {
        validateRequiredEnvVars();

        const rootConfig = {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            database: "postgres",
            ssl:
                process.env.DB_SSL === "true"
                    ? { rejectUnauthorized: false }
                    : undefined,
        };

        const dbName = process.env.DB_NAME!;
        const dbUser = process.env.DB_USER!;
        const dbPass = process.env.DB_PASSWORD!;

        validateDatabaseName(dbName);
        validateDatabaseName(dbUser);

        const client = new Client(rootConfig);
        await client.connect();

        const res = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );

        if (res.rowCount === 0) {
            console.log(`📦 Criando banco de dados '${dbName}'...`);
            const createDbQuery = format("CREATE DATABASE %I", dbName);
            await client.query(createDbQuery);
        } else {
            console.log(`✅ Banco '${dbName}' já existe.`);
        }

        const userRes = await client.query(
            `SELECT 1 FROM pg_roles WHERE rolname = $1`,
            [dbUser]
        );

        if (userRes.rowCount === 0) {
            console.log(`👤 Criando usuário '${dbUser}'...`);

            const createUserQuery = format(
                "CREATE USER %I WITH PASSWORD %L",
                dbUser,
                dbPass
            );
            await client.query(createUserQuery);

            const grantQuery = format(
                "GRANT ALL PRIVILEGES ON DATABASE %I TO %I",
                dbName,
                dbUser
            );
            await client.query(grantQuery);
        } else {
            console.log(`✅ Usuário '${dbUser}' já existe.`);
        }

        await client.end();
    } catch (err: any) {
        if (err.message.includes("Variáveis de ambiente")) {
            console.error(`❌ Erro de configuração: ${err.message}`);
        } else if (err.code === "ECONNREFUSED") {
            console.error(
                `❌ Erro de conexão: Não foi possível conectar ao servidor PostgreSQL`
            );
        } else if (err.code === "28P01") {
            console.error(`❌ Erro de autenticação: Credenciais inválidas`);
        } else {
            console.error(`❌ Erro ao criar banco ou usuário: ${err.message}`);
        }
        if (process.env.NODE_ENV !== "production") {
            console.error(err);
        }

        process.exit(1);
    }
}
