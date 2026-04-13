import 'dotenv/config';
import express from "express"
import cors from "cors"

import seriesRoutes from "./src/api/series.routes.js"
import volumesRoutes from "./src/api/volumes.routes.js"

const app = express()

app.use(cors())
app.use(express.json())



// rotas
app.use("/api/series", seriesRoutes)
app.use("/api/volumes", volumesRoutes)

//imagens
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`)
  console.log("DB:", process.env.DATABASE_URL);
})