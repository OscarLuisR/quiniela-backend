import "dotenv/config";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { errorBodyHandler } from "./middlewares/errorBody.middleware.js";

// Inicializaciones
const app = express();

// Settings
app.set("port", process.env.PORT || 4000);

// Middleware
app.use(
    cors({
        origin: [
            "http://localhost:4200",
            "http://localhost:4300",
            process.env.FRONTEND_URL || "", // 👈 Agrega esto
        ].filter(Boolean), // 👈 Esto elimina valores vacíos
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }),
);

app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Valida el cuerpo del Body
app.use(errorBodyHandler);

// Routes
app.use("/api", routes);

// // ❌ Middleware para rutas no encontradas (404)
// app.use((req, res) => {
//     res.status(404).json({
//         status: 404,
//         message: "Recurso no encontrado",
//     });
// });

// 🧯 Manejador de errores general
app.use(errorHandler);

// Exportamos la aplicacion
export default app;
