import mongoose from "mongoose";
import { AppError } from "../utils/appError";

export async function conectarMongo() {
    try {
        // Crea las cadenas de conexion
        //const uriQuiniela = `mongodb+srv://${process.env.APP_DB_USER}:${process.env.APP_DB_PASSWORD}@cluster0.1dmfw.mongodb.net/${process.env.APP_DB_DATABASE}?retryWrites=true&w=majority&appName=Cluster0`;
        const uriQuiniela = `mongodb://${process.env.APP_DB_USER}:${process.env.APP_DB_PASSWORD}@cluster0-shard-00-00.1dmfw.mongodb.net:27017,cluster0-shard-00-01.1dmfw.mongodb.net:27017,cluster0-shard-00-02.1dmfw.mongodb.net:27017/${process.env.APP_DB_DATABASE}?replicaSet=atlas-pfeksf-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority`;

        // Listeners de eventos en el objeto de conexión Tienda
        mongoose.connection.on("connected", () => {
            console.log(
                `✅ Conectado a la Base de Datos ${process.env.APP_DB_DATABASE}`,
            );
        });

        mongoose.connection.on("error", (err) => {
            // - En lugar de process.exit(1), podrías:
            // - Notificar a un sistema de monitoreo
            // - Intentar reconectar

            console.error(`❌ Error de conexión: ${err.message.trim()}`);
            process.exit(1);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("⚠️  Desconectado de MongoDB Atlas");
        });

        // Creamos la conexion
        // await mongoose.connect(uriQuiniela, { family: 4 }); // ✅ conexión global

        await mongoose.connect(uriQuiniela, {
            family: 4, // <--- OBLIGA a usar IPv4 (esto quita el 90% de los timeouts)
            serverSelectionTimeoutMS: 15000, // No esperes 30 seg, si en 10 no conecta, hay algo mal
            connectTimeoutMS: 10000,
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? `❌ Error al conectar con MongoDB Atlas: ${error.message.trim()}`
                : `❌ Error desconocido al conectar con MongoDB Atlas`;

        // throw new Error(message);

        throw new AppError(message, 500, "db:conectarMongo");
    }
}
