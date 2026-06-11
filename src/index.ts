import app from "./app.js";
import { conectarMongo } from "./database/db.js";
import { cargaDataInicial } from "./database/seed.js";
import iniciarWorkerCierre from "./jobs/cierrePartidos.js";

const PORT = app.get("port");

async function main() {
    try {
        await conectarMongo();

        await cargaDataInicial();

        // 2. ENCENDEMOS EL WORKER AQUÍ
        // Ya hay conexión a Mongo y la data inicial está cargada
        iniciarWorkerCierre();

        app.listen(PORT, () => {
            console.log(`🚀 Servidor escuchando en el puerto ${PORT}...`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
