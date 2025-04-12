import express from "express";
import loteRoutes from "./routes/loteRoutes";
import boletoRoutes from "./routes/boletoRoutes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use("/api/lotes", loteRoutes);
app.use("/api/boletos", boletoRoutes);

export default app;
