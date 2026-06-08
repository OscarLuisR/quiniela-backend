import mongoose, { Types } from "mongoose";
import { FaseModel } from "../models/fase.model.js";
import { AppError } from "../utils/appError.js";
import type { IFase } from "../types/IFase.js";
import { UsuarioModel } from "../models/usuario.model.js";
import { CalendarioModel } from "../models/calendario.model.js";
import { PronosticoModel } from "../models/pronostico.model.js";
import { IUsuarioStatus } from "../types/IUsuarioStatus.js";

export async function getFasesAllService(): Promise<{ docs: IFase[] }> {
    const results = await FaseModel.find({}).sort({ orden: 1 });

    return {
        docs: results,
    };
}

export async function getFasesOpenService(): Promise<{ docs: IFase[] }> {
    const results = await FaseModel.find({ faseAbierta: true }).sort({
        orden: 1,
    });

    return {
        docs: results,
    };
}

export async function updateFaseService(
    _id: string,
    status: boolean,
    adminId: string,
): Promise<void> {
    // 1. Verifico si la etapa existe
    const resulFase = await FaseModel.findById(_id);

    if (!resulFase) {
        throw new AppError(
            "Etapa No Encontrada",
            404,
            "service:updateFaseService",
        );
    }

    // 2. CASO A: CERRAR (Solo actualizar estatus)
    if (status === false) {
        await FaseModel.findByIdAndUpdate(_id, { faseAbierta: false });

        return;
    }

    // 3. CASO B: ABRIR (Proceso Doble con Transacción)
    // Solo procedemos si la etapa estaba cerrada (para no duplicar pronósticos)
    if (status === true && resulFase.faseAbierta === false) {
        const session = await mongoose.startSession();

        // Inicio la sesion
        session.startTransaction();

        try {
            // 🌟 OPTIMIZACIÓN: Instanciamos los ObjectIds UNA sola vez aquí afuera
            const faseObjectId = new Types.ObjectId(_id);

            // PASO 3.1: Actualizar el estatus del usuario
            await FaseModel.findByIdAndUpdate(
                _id,
                { faseAbierta: true },
                { session },
            );

            // PASO 3.2: - Busca todo el calendario disponible para la fase
            const findCalendario = await CalendarioModel.find({
                idFase: _id,
            })
                .sort({ fecha: 1, nroPartido: 1 })
                .session(session);

            // Verifica si existe calenadrio para la fase
            if (!findCalendario.length) {
                throw new AppError(
                    `⚠️ No se pudo crear el pronostico porque no esta creado el Calendario para la ${resulFase.nombre}`,
                    404,
                    "service:updateFaseService",
                );
            }

            // PASO 3.3: Busca los IDs de los Usuarios activos
            const resultsUsers = await UsuarioModel.find({
                _id: { $ne: adminId },
                status: IUsuarioStatus.Activo,
            }).session(session);

            // --- LÓGICA DE SINCRONIZACIÓN (UPSERT) ---
            const operacionesBulk = [];

            // Recorro el array de los usuarios activos
            for (const user of resultsUsers) {
                const userObjectId = new Types.ObjectId(user._id);

                // PASO 3.4: Preparar operaciones Upsert
                for (const partido of findCalendario) {
                    const partidoObjectId = partido._id as Types.ObjectId;

                    operacionesBulk.push({
                        updateOne: {
                            // Criterio de búsqueda: ¿Ya existe este pronóstico para este usuario y este partido?
                            filter: {
                                idUsuario: userObjectId,
                                idFase: faseObjectId,
                                idCalendario: partidoObjectId,
                            },
                            // Si NO existe, inserta estos datos
                            update: {
                                $setOnInsert: {
                                    idUsuario: userObjectId,
                                    idFase: faseObjectId,
                                    idCalendario: partidoObjectId,
                                    golesEquipoA: null,
                                    golesEquipoB: null,
                                    idGanador: null,
                                    puntosLogro: 0,
                                    puntosMarcadorA: 0,
                                    puntosMarcadorB: 0,
                                    puntosMarcadorExacto: 0,
                                    puntosTotales: 0,
                                    aceptaPronostico: true,
                                },
                            },
                            // Upsert: true permite que si no existe lo cree, y si existe no haga nada (por el $setOnInsert)
                            upsert: true,
                        },
                    });
                }
            }

            // PASO 3.5: Ejecutar BulkWrite
            if (operacionesBulk.length > 0) {
                await PronosticoModel.bulkWrite(operacionesBulk, { session });
            }

            // Si llegamos aquí, todo está bien
            await session.commitTransaction();
        } catch (error: any) {
            // Si algo falla en cualquier punto, NADA de lo anterior se guarda
            await session.abortTransaction();

            // 🎯 SI EL ERROR YA ERA UN APPERROR, DÉJALO PASAR INTACTO:
            if (error instanceof AppError) throw error;

            throw new AppError(
                "Error en transacción: " + error.message,
                500,
                "service:updateFaseService",
            );
        } finally {
            session.endSession();
        }
    }

    return;
}

export async function getFasesEliminacionDirectaOpenService(): Promise<{
    docs: IFase[];
}> {
    const results = await FaseModel.find({
        faseAbierta: true,
        iso_fase: { $ne: "FG" }, // <-- Aquí aplicamos la condición "distinto a FG"
    }).sort({
        orden: 1,
    });

    return {
        docs: results,
    };
}
