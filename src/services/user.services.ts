import mongoose, { Types } from "mongoose";
import { UsuarioModel } from "../models/usuario.model.js";
import { RolModel } from "../models/rol.model.js";
import { encriptarPassword } from "../utils/funcionesGlobales.js";
import type { IUsuarioRequest } from "../types/IUsuarioRequest.js";
import type { IUsuario } from "../types/IUsuario.js";
import type { PaginateResult } from "mongoose";
import { IUsuarioStatus } from "../types/IUsuarioStatus.js";
import { AppError } from "../utils/appError.js";
import { FaseModel } from "../models/fase.model.js";
import { CalendarioModel } from "../models/calendario.model.js";
import { PronosticoModel } from "../models/pronostico.model.js";
import { RankingModel } from "../models/ranking.model.js";

export async function getUsersService(
    id: string,
    page: number,
    limit: number,
    statusUser?: string,
    search?: string,
): Promise<{
    docs: IUsuario[];
    pagination: Omit<PaginateResult<IUsuario>, "docs">;
}> {
    // 1. Filtro base: Excluir al admin actual
    const query: any = { _id: { $ne: id } };

    // 2. Filtro de Estatus (si viene y no es string vacío)
    if (statusUser) {
        query.status = statusUser;
    }

    // 3. Filtro de Búsqueda (Buscamos por nombre o email)
    if (search) {
        // 'i' hace que no importe mayúsculas/minúsculas
        const regex = new RegExp(search, "i");

        query.$or = [{ nombre: regex }, { email: regex }];
    }

    const results = await UsuarioModel.paginate(query, {
        page,
        limit,
        sort: { nombre: 1 },
        populate: {
            path: "idRol",
            model: "Rol", // 👈 nombre del modelo como string
            select: "_id nombre",
        },
    });

    return {
        docs: results.docs,
        pagination: {
            totalDocs: results.totalDocs,
            limit: results.limit,
            page: results.page,
            totalPages: results.totalPages,
            hasNextPage: results.hasNextPage,
            hasPrevPage: results.hasPrevPage,
            nextPage: results.nextPage,
            prevPage: results.prevPage,
            pagingCounter: results.pagingCounter,
        },
    };
}

export async function createUserService(
    data: IUsuarioRequest,
): Promise<IUsuario> {
    // Verifica que no exista el nombre del usuario o el email. Para evitar duplicados
    const findUser = await UsuarioModel.findOne({
        $or: [
            { nombre: new RegExp(`^${data.nombre}$`, "i") },
            { email: new RegExp(`^${data.email}$`, "i") },
        ],
    });

    if (findUser) {
        if (findUser.nombre.toLowerCase() === data.nombre.toLowerCase()) {
            throw new AppError(
                "El Nombre del Usuario ya Existe",
                409,
                "service:createUserService",
            );
        }

        if (findUser.email.toLowerCase() === data.email.toLowerCase()) {
            throw new AppError(
                "El Email ya Existe",
                409,
                "service:createUserService",
            );
        }
    }

    // Busca los datos del Rol Jugador
    const rolFind = await RolModel.findOne({
        nombre: new RegExp(`^${"Jugador"}$`, "i"),
    });

    // Verifica si se encontro el Rol Jugador
    if (!rolFind) {
        throw new AppError(
            `⚠️ No se pudo crear el usuario ${data.nombre} porque no existe el rol 'Jugador'.`,
            404,
            "service:createUserService",
        );
    }

    const resultCreate = await UsuarioModel.create({
        nombre: data.nombre.trim(),
        email: data.email.trim(),
        status: IUsuarioStatus.Inactivo,
        password: await encriptarPassword(
            data.password,
            "service:createUserService",
        ),
        idRol: rolFind._id,
    });

    const result = await resultCreate.populate({
        path: "idRol",
        model: RolModel,
        select: "_id nombre",
    });

    return result;
}

export async function updateUserService(
    _id: string,
    status: string,
): Promise<void> {
    // 1. Verifico si el usuario existe
    const resulUsuario = await UsuarioModel.findById(_id);

    if (!resulUsuario) {
        throw new AppError(
            "Usuario No Encontrado",
            404,
            "service:updateUserService",
        );
    }

    // 2. CASO A: INACTIVAR (Solo actualizar estatus)
    if (status.toLowerCase() === "inactivo") {
        await UsuarioModel.findByIdAndUpdate(_id, { status: "inactivo" });

        return;
    }

    // 3. CASO B: ACTIVAR (Proceso Doble con Transacción)
    // Solo procedemos si el usuario estaba inactivo (para no duplicar pronósticos)
    if (
        status.toLowerCase() === "activo" &&
        resulUsuario.status.toLowerCase() === "inactivo"
    ) {
        const session = await mongoose.startSession();

        // Inicio la sesion
        session.startTransaction();

        try {
            // 🌟 OPTIMIZACIÓN: Instanciamos el ObjectId del usuario UNA sola vez aquí afuera
            const userObjectId = new Types.ObjectId(_id);

            // PASO 3.1: Actualizar el estatus del usuario
            await UsuarioModel.findByIdAndUpdate(
                _id,
                { status: "activo" },
                { session },
            );

            // PASO 3.2: Busca EL ID de las Fases de Grupos Abiertas
            const resultsFases = await FaseModel.find({ faseAbierta: true })
                .sort({
                    idFase: 1,
                    orden: 1,
                })
                .session(session);

            // Verifica si existe la fase
            if (resultsFases.length === 0) {
                throw new AppError(
                    `⚠️ No se pudo crear el pronostico porque no hay Fases Abiertas.`,
                    404,
                    "service:updateUserService",
                );
            }

            // 🌟 GRAN OPTIMIZACIÓN (Evitamos el Query N+1):
            // PASO 3.3: Extraemos todos los IDs de las fases abiertas para hacer UNA sola consulta al calendario
            const idsFases = resultsFases.map((fase) => fase._id);

            const todosLosPartidos = await CalendarioModel.find({
                idFase: { $in: idsFases },
            })
                .sort({ fecha: 1, nroPartido: 1 })
                .session(session);

            // Agrupamos los partidos por su idFase en un Map en memoria para mantener tus validaciones intactas
            const partidosPorFase = new Map<string, any[]>();

            for (const partido of todosLosPartidos) {
                const idFaseStr = partido.idFase.toString();

                if (!partidosPorFase.has(idFaseStr)) {
                    partidosPorFase.set(idFaseStr, []);
                }

                partidosPorFase.get(idFaseStr)!.push(partido);
            }

            // --- LÓGICA DE SINCRONIZACIÓN (UPSERT) ---
            const operacionesBulk = [];

            // Recorro el array de las fases abiertas
            for (const fase of resultsFases) {
                const faseObjectId = fase._id as Types.ObjectId;

                // Obtenemos los partidos del Map en memoria
                const findCalendario =
                    partidosPorFase.get(faseObjectId.toString()) || [];

                // Conservamos tu regla de negocio: si una fase abierta no tiene partidos en el calendario, se cae el proceso
                if (!findCalendario.length) {
                    throw new AppError(
                        `⚠️ No se pudo crear el pronostico porque no esta creado el Calendario para la ${fase.nombre}`,
                        404,
                        "service:updateUserService",
                    );
                }

                // PASO 3.4: Preparar operaciones Upsert
                for (const partido of findCalendario) {
                    const partidoObjectId = partido._id as Types.ObjectId;

                    // 🌟 LA MAGIA AQUÍ: Evaluamos el estatus del partido
                    // Si statusJuego === 0 (Pendiente), aceptaPronostico es TRUE.
                    // Si statusJuego !== 0 (En progreso, cerrado, cancelado), aceptaPronostico es FALSE.
                    const permitePronostico = partido.statusJuego === 0;

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
                                    // Asignamos dinámicamente el valor calculado
                                    aceptaPronostico: permitePronostico,
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

            // PASO 3.6: Verifico si el usuario existe en la tabla Ranking
            const resulRanking = await RankingModel.findOne({
                idUsuario: userObjectId,
            }).session(session);

            // PASO 3.7: Si no existe inserto el usuario en la tabla Ranking
            if (!resulRanking) {
                await RankingModel.create(
                    [
                        {
                            idUsuario: userObjectId,
                            puntosTotales: 0,
                            ranking: 0,
                            cantidadPartidos: 0,
                        },
                    ],
                    { session },
                );
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
                "service:updateUserService",
            );
        } finally {
            session.endSession();
        }
    }

    return;
}

// export async function updateUserService(
//     _id: string,
//     status: string,
// ): Promise<void> {
//     const validStatus = ["activo", "inactivo"];

//     // 1. Verifico si el usuario existe
//     const resultById = await UsuarioModel.findById({ _id: _id });

//     if (!resultById) {
//         throw new AppError("Usuario No Encontrado", 404, "updateUserService");
//     }

//     // Verifico si el estatus es correcto
//     if (!validStatus.includes(status.toLocaleLowerCase())) {
//         throw new AppError(
//             "El Estatus asignado al Usuario es inválido",
//             400,
//             "updateUserService",
//         );
//     }

//     // Actualiza el Usuario
//     const result = await UsuarioModel.findByIdAndUpdate(
//         { _id: _id },
//         { status: status },
//         {
//             new: true,
//         },
//     );

//     if (!result) {
//         throw new AppError("Usuario No Encontrado", 404, "updateUserService");
//     }

//     return;
// }

// export async function getUserIdService(_id: string): Promise<IUsuario | null> {
//     const result = await UsuarioModel.findById({ _id: _id }).populate({
//         path: "idRol",
//         model: RolModel,
//         select: "_id name",
//     });

//     if (!result) {
//         throw new AppError("Usuario No Encontrado", 404, "getUserIdService");
//     }

//     return result;
// }

// export async function deleteUserService(_id: string): Promise<void> {
//     const result = await UsuarioModel.findById({ _id: _id });

//     if (!result) {
//         throw new AppError("Usuario No Encontrado", 404, "deleteUserService");
//     }

//     await UsuarioModel.findByIdAndDelete({ _id: _id });

//     return;
// }
