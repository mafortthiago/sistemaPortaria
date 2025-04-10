import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Bem-vindo ao sistema de portaria!");
});

export default router;
