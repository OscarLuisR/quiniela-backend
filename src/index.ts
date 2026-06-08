import app from "./app.js";
import { conectarMongo } from "./database/db.js";
import { cargaDataInicial } from "./database/seed.js";

const PORT = app.get("port");

async function main() {
    try {
        await conectarMongo();

        await cargaDataInicial();

        app.listen(PORT, () => {
            console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
