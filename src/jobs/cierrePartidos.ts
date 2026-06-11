import cron from "node-cron";
import { CalendarioModel } from "../models/calendario.model.js";
import { PronosticoModel } from "../models/pronostico.model.js"; // Importa tu modelo de Pronostico

const iniciarWorkerCierre = (): void => {
    // 1. Se ejecuta cada 5 minutos
    cron.schedule("*/5 * * * *", async () => {
        // 6. Agregamos el timestamp a todos los console.log
        console.log(
            `⏳ [Cron] ${obtenerTimestamp()} Iniciando revisión de partidos...`,
        );

        try {
            const ahora = new Date();

            // 2. Cambiamos el límite de 1 hora a 10 minutos (10 * 60 * 1000)
            const horaLimite = new Date(ahora.getTime() + 10 * 60 * 1000);

            // 3. Buscamos los partidos que cumplen la condición para el cierre
            const partidosPorCerrar = await CalendarioModel.find({
                statusJuego: 0,
                fecha: { $lte: horaLimite },
            })
                .sort({ fecha: 1 })
                .select("_id"); // Solo necesitamos los IDs de los partidos

            // Si hay partidos por cerrar entonces
            if (partidosPorCerrar.length > 0) {
                const idsPartidos = partidosPorCerrar.map((p) => p._id);

                // 4. Actualizamos todos los pronósticos asociados a esos partidos
                const resultado = await PronosticoModel.updateMany(
                    {
                        idCalendario: { $in: idsPartidos }, // Filtra por los partidos encontrados
                        aceptaPronostico: true, // Solo los que aún siguen abiertos
                    },
                    { $set: { aceptaPronostico: false } }, // Cerramos el pronóstico
                );

                // 5. Blindaje: Cambiamos el statusJuego a 1 (En proceso)
                // Esto evita que el cron los vuelva a seleccionar en la próxima vuelta.
                await CalendarioModel.updateMany(
                    { _id: { $in: idsPartidos } },
                    { $set: { statusJuego: 1 } },
                );

                console.log(
                    `🔄 [Cron] ${obtenerTimestamp()} Se actualizó el status a 'EN PROCESO' para ${idsPartidos.length} partido(s).`,
                );

                if (resultado.modifiedCount > 0) {
                    console.log(
                        `✅ [Cron] ${obtenerTimestamp()} Se cerraron exitosamente ${resultado.modifiedCount} pronóstico(s).`,
                    );
                } else {
                    console.log(
                        `ℹ️ [Cron] ${obtenerTimestamp()} Los partidos iniciaron, pero no se encontraron pronósticos abiertos para cerrar.`,
                    );
                }
            } else {
                console.log(
                    `ℹ️ [Cron] ${obtenerTimestamp()} No hay partidos cercanos a cerrar.`,
                );
            }
        } catch (error) {
            console.error(
                `❌ [Cron] ${obtenerTimestamp()} Error en el cierre:`,
                error,
            );
        }
    });
};

// Función auxiliar para generar la fecha en formato [YYYY-MM-DD HH:mm:ss]
const obtenerTimestamp = (): string => {
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, "0");
    const day = String(ahora.getDate()).padStart(2, "0");
    const hours = String(ahora.getHours()).padStart(2, "0");
    const minutes = String(ahora.getMinutes()).padStart(2, "0");
    const seconds = String(ahora.getSeconds()).padStart(2, "0");

    return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`;
};

export default iniciarWorkerCierre;
