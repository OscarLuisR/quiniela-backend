import mongoose, { Types, type PaginateResult } from "mongoose";
import { CalendarioModel } from "../models/calendario.model.js";
import { ClasificacionModel } from "../models/clasificacion.model.js";
import type { ICalendario } from "../types/ICalendario.js";
import { AppError } from "../utils/appError.js";
import { PronosticoModel } from "../models/pronostico.model.js";
import { RankingModel } from "../models/ranking.model.js";

export async function getCalendarioByFaseService(
    _id: string,
): Promise<{ docs: ICalendario[] }> {
    const results = await CalendarioModel.aggregate([
        // 1. Filtrar por la fase
        { $match: { idFase: new mongoose.Types.ObjectId(_id) } },

        // 2. Ordenar por fecha cronológicamente
        { $sort: { fecha: 1, nroPartido: 1 } },

        // 3. Lookups (Cruces de colecciones)
        {
            $lookup: {
                from: "selecciones",
                localField: "idEquipoA",
                foreignField: "_id",
                as: "eqA",
            },
        },
        {
            $lookup: {
                from: "selecciones",
                localField: "idEquipoB",
                foreignField: "_id",
                as: "eqB",
            },
        },
        {
            $lookup: {
                from: "grupos",
                localField: "idGrupo",
                foreignField: "_id",
                as: "grp",
            },
        },
        {
            $lookup: {
                from: "sedes",
                localField: "idSede",
                foreignField: "_id",
                as: "sde",
            },
        },

        // 4. PROYECCIÓN FINAL (Inclusión y Mapeo en un solo paso)
        {
            $project: {
                // Campos base del calendario (Inclusión explícita)
                _id: 1,
                nroPartido: 1,
                fecha: 1,
                idFase: 1,
                golesEquipoA: 1,
                golesEquipoB: 1,
                statusJuego: 1,
                idGanador: 1,

                // Mapeamos los objetos relacionados controlando nulos/missing
                idEquipoA: {
                    $let: {
                        vars: { team: { $arrayElemAt: ["$eqA", 0] } },
                        in: {
                            $cond: {
                                // Si 'team' es nulo o indefinido, la expresión dará true
                                if: {
                                    $eq: [{ $ifNull: ["$$team", null] }, null],
                                },
                                // En ese caso devolvemos null explícitamente
                                then: null,
                                // Si existe el documento, mapeamos sus campos
                                else: {
                                    _id: "$$team._id",
                                    pais: "$$team.pais",
                                    codigo_iso: "$$team.codigo_iso",
                                    bandera_url: "$$team.bandera_url",
                                },
                            },
                        },
                    },
                },
                idEquipoB: {
                    $let: {
                        vars: { team: { $arrayElemAt: ["$eqB", 0] } },
                        in: {
                            $cond: {
                                // Si 'team' es nulo o indefinido, la expresión dará true
                                if: {
                                    $eq: [{ $ifNull: ["$$team", null] }, null],
                                },
                                // En ese caso devolvemos null explícitamente
                                then: null,
                                // Si existe el documento, mapeamos sus campos
                                else: {
                                    _id: "$$team._id",
                                    pais: "$$team.pais",
                                    codigo_iso: "$$team.codigo_iso",
                                    bandera_url: "$$team.bandera_url",
                                },
                            },
                        },
                    },
                },
                idGrupo: {
                    $let: {
                        vars: { g: { $arrayElemAt: ["$grp", 0] } },
                        in: {
                            $cond: {
                                // Opcional: Protegemos idGrupo si en fases finales es nulo
                                if: { $eq: [{ $ifNull: ["$$g", null] }, null] },
                                then: null,
                                else: {
                                    _id: "$$g._id",
                                    nombre: "$$g.nombre",
                                },
                            },
                        },
                    },
                },
                idSede: {
                    $let: {
                        vars: { s: { $arrayElemAt: ["$sde", 0] } },
                        in: {
                            $cond: {
                                // Opcional: Protegemos idSede ante cualquier inconsistencia
                                if: { $eq: [{ $ifNull: ["$$s", null] }, null] },
                                then: null,
                                else: {
                                    _id: "$$s._id",
                                    pais: "$$s.pais",
                                    ciudad: "$$s.ciudad",
                                    estadium: "$$s.estadium",
                                    capacidad: "$$s.capacidad",
                                },
                            },
                        },
                    },
                },
            },
        },
    ]);

    return {
        docs: results,
    };
}

export async function getProximosPartidosService(
    localDate: string,
): Promise<{ docs: ICalendario[] }> {
    // 1. Extraemos año, mes y día del string que manda el frontend
    const [year, month, day] = localDate.split("-").map(Number);

    // 2. Creamos el punto de partida en UTC puro (00:00:00)
    // Esto es un "ancla" segura. Cubre desde antes de que empiece el día
    // en Venezuela, Chile, Argentina o USA.
    const startDateUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

    // 3. Traemos un bloque de partidos en crudo a partir de ese ancla
    // Puedes ajustar el limit según cuántos partidos en promedio haya por día
    // 3. Traemos los partidos y usamos populate para hacer el "join"
    const results = await CalendarioModel.aggregate([
        {
            $match: {
                fecha: { $gte: startDateUTC },
            },
        },
        { $sort: { fecha: 1, nroPartido: 1 } },
        { $limit: 20 },
        // Lookups a las tablas relacionadas (Selecciones, Grupos, Sedes)
        {
            $lookup: {
                from: "selecciones",
                localField: "idEquipoA",
                foreignField: "_id",
                as: "eqA",
            },
        },
        {
            $lookup: {
                from: "selecciones",
                localField: "idEquipoB",
                foreignField: "_id",
                as: "eqB",
            },
        },
        {
            $lookup: {
                from: "grupos",
                localField: "idGrupo",
                foreignField: "_id",
                as: "grp",
            },
        },
        {
            $lookup: {
                from: "sedes",
                localField: "idSede",
                foreignField: "_id",
                as: "sde",
            },
        },
        // Proyección limpia sin idFase ni idGanador
        {
            $project: {
                _id: 1,
                nroPartido: 1,
                fecha: 1,
                golesEquipoA: 1,
                golesEquipoB: 1,
                statusJuego: 1,

                // Estructura idEquipoA limpia, idéntica al primer endpoint
                idEquipoA: {
                    $let: {
                        vars: { team: { $arrayElemAt: ["$eqA", 0] } },
                        in: {
                            $cond: {
                                if: {
                                    $eq: [{ $ifNull: ["$$team", null] }, null],
                                },
                                then: null,
                                else: {
                                    _id: "$$team._id",
                                    pais: "$$team.pais",
                                    codigo_iso: "$$team.codigo_iso",
                                    bandera_url: "$$team.bandera_url",
                                },
                            },
                        },
                    },
                },
                // Estructura idEquipoB limpia, idéntica al primer endpoint
                idEquipoB: {
                    $let: {
                        vars: { team: { $arrayElemAt: ["$eqB", 0] } },
                        in: {
                            $cond: {
                                if: {
                                    $eq: [{ $ifNull: ["$$team", null] }, null],
                                },
                                then: null,
                                else: {
                                    _id: "$$team._id",
                                    pais: "$$team.pais",
                                    codigo_iso: "$$team.codigo_iso",
                                    bandera_url: "$$team.bandera_url",
                                },
                            },
                        },
                    },
                },
                // Estructura idGrupo limpia
                idGrupo: {
                    $let: {
                        vars: { g: { $arrayElemAt: ["$grp", 0] } },
                        in: {
                            $cond: {
                                if: { $eq: [{ $ifNull: ["$$g", null] }, null] },
                                then: null,
                                else: {
                                    _id: "$$g._id",
                                    nombre: "$$g.nombre",
                                },
                            },
                        },
                    },
                },
                // Estructura idSede limpia
                idSede: {
                    $let: {
                        vars: { s: { $arrayElemAt: ["$sde", 0] } },
                        in: {
                            $cond: {
                                if: { $eq: [{ $ifNull: ["$$s", null] }, null] },
                                then: null,
                                else: {
                                    _id: "$$s._id",
                                    pais: "$$s.pais",
                                    ciudad: "$$s.ciudad",
                                    estadium: "$$s.estadium",
                                    capacidad: "$$s.capacidad",
                                },
                            },
                        },
                    },
                },
            },
        },
    ]);

    return {
        docs: results,
    };
}

export async function getCalendarioByFasePaginacionService(
    _id: string,
    page: number,
    limit: number,
    statusCalendario?: string,
): Promise<{
    docs: ICalendario[];
    pagination: Omit<PaginateResult<ICalendario>, "docs">;
}> {
    // Calculamos cuántos documentos saltar
    const skip = (page - 1) * limit;

    // 1. Construimos el filtro base (siempre filtramos por idFase)
    const matchFilter: any = {
        idFase: new mongoose.Types.ObjectId(_id),
    };

    // 2. Si el usuario envió un estatus ('abierto' o 'cerrado'), lo agregamos al filtro
    if (statusCalendario) {
        if (statusCalendario === "abierto") {
            matchFilter.statusJuego = 0;
        } else if (statusCalendario === "progreso") {
            matchFilter.statusJuego = 1;
        } else {
            matchFilter.statusJuego = 2;
        }
    }

    const results = await CalendarioModel.aggregate([
        // 1. FILTRAR: Usamos nuestro matchFilter dinámico
        {
            $match: matchFilter,
        },

        // 2. Ordenar por fecha cronológicamente
        { $sort: { fecha: 1, nroPartido: 1 } },

        // 3. FACET: Divide el flujo para contar el total y paginar al mismo tiempo
        {
            $facet: {
                // Flujo A: Solo cuenta el total de documentos que pasaron el filtro
                metadata: [{ $count: "totalDocs" }],

                // Flujo B: Trae la data, la pagina y hace los cruces
                data: [
                    // APLICAMOS LA PAGINACIÓN PRIMERO (Súper optimización)
                    { $skip: skip },
                    { $limit: limit },

                    // Lookups optimizados (solo se ejecutan para los limitados de esta página)
                    {
                        $lookup: {
                            from: "selecciones",
                            localField: "idEquipoA",
                            foreignField: "_id",
                            as: "eqA",
                        },
                    },
                    {
                        $lookup: {
                            from: "selecciones",
                            localField: "idEquipoB",
                            foreignField: "_id",
                            as: "eqB",
                        },
                    },
                    {
                        $lookup: {
                            from: "grupos",
                            localField: "idGrupo",
                            foreignField: "_id",
                            as: "grp",
                        },
                    },
                    {
                        $lookup: {
                            from: "sedes",
                            localField: "idSede",
                            foreignField: "_id",
                            as: "sde",
                        },
                    },

                    // 4. PROYECCIÓN FINAL CORREGIDA Y HOMOLOGADA
                    {
                        $project: {
                            _id: 1,
                            nroPartido: 1,
                            fecha: 1,
                            idFase: 1,
                            golesEquipoA: 1,
                            golesEquipoB: 1,
                            statusJuego: 1,
                            idGanador: 1,

                            // Equipo A: Limpio y protegido contra nulos/indefinidos
                            idEquipoA: {
                                $let: {
                                    vars: {
                                        team: { $arrayElemAt: ["$eqA", 0] },
                                    },
                                    in: {
                                        $cond: {
                                            if: {
                                                $eq: [
                                                    {
                                                        $ifNull: [
                                                            "$$team",
                                                            null,
                                                        ],
                                                    },
                                                    null,
                                                ],
                                            },
                                            then: null,
                                            else: {
                                                _id: "$$team._id",
                                                pais: "$$team.pais",
                                                codigo_iso: "$$team.codigo_iso",
                                                bandera_url:
                                                    "$$team.bandera_url",
                                            },
                                        },
                                    },
                                },
                            },
                            // Equipo B: Limpio y protegido contra nulos/indefinidos
                            idEquipoB: {
                                $let: {
                                    vars: {
                                        team: { $arrayElemAt: ["$eqB", 0] },
                                    },
                                    in: {
                                        $cond: {
                                            if: {
                                                $eq: [
                                                    {
                                                        $ifNull: [
                                                            "$$team",
                                                            null,
                                                        ],
                                                    },
                                                    null,
                                                ],
                                            },
                                            then: null,
                                            else: {
                                                _id: "$$team._id",
                                                pais: "$$team.pais",
                                                codigo_iso: "$$team.codigo_iso",
                                                bandera_url:
                                                    "$$team.bandera_url",
                                            },
                                        },
                                    },
                                },
                            },
                            // Grupo: Limpio y protegido contra nulos
                            idGrupo: {
                                $let: {
                                    vars: { g: { $arrayElemAt: ["$grp", 0] } },
                                    in: {
                                        $cond: {
                                            if: {
                                                $eq: [
                                                    { $ifNull: ["$$g", null] },
                                                    null,
                                                ],
                                            },
                                            then: null,
                                            else: {
                                                _id: "$$g._id",
                                                nombre: "$$g.nombre",
                                            },
                                        },
                                    },
                                },
                            },
                            // Sede: Limpia y protegida contra nulos
                            idSede: {
                                $let: {
                                    vars: { s: { $arrayElemAt: ["$sde", 0] } },
                                    in: {
                                        $cond: {
                                            if: {
                                                $eq: [
                                                    { $ifNull: ["$$s", null] },
                                                    null,
                                                ],
                                            },
                                            then: null,
                                            else: {
                                                _id: "$$s._id",
                                                pais: "$$s.pais",
                                                ciudad: "$$s.ciudad",
                                                estadium: "$$s.estadium",
                                                capacidad: "$$s.capacidad",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        },
    ]);

    // 5. EXTRACCIÓN Y CÁLCULO MANUAL DE PAGINACIÓN
    const result = results[0];
    const docs = result.data;

    // Si no hay resultados, totalDocs es 0
    const totalDocs =
        result.metadata.length > 0 ? result.metadata[0].totalDocs : 0;

    // Calculamos las variables exactas
    const totalPages = Math.ceil(totalDocs / limit);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    // 6. RETORNAMOS EL FORMATO IDÉNTICO
    return {
        docs,
        pagination: {
            totalDocs,
            limit,
            page,
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null,
            pagingCounter: skip + 1,
        },
    };
}

export async function updateStatusCalendarioService(
    _id: string,
    statusJuego: number,
): Promise<void> {
    // 1. Verifico si la etapa existe
    const resultCalendario = await CalendarioModel.findById(_id);

    if (!resultCalendario) {
        throw new AppError(
            "Partido No Encontrado",
            404,
            "service:updateStatusCalendarioService",
        );
    }

    // 2. Actualizo el estatus del partido
    await CalendarioModel.findByIdAndUpdate(_id, { statusJuego: statusJuego });

    return;
}

export async function updateCierreCalendarioService(
    _id: string,
    golesEquipoA: number,
    golesEquipoB: number,
    statusJuego: number,
): Promise<void> {
    // 1. Verifico si el aprtido existe
    const resultCalendario = await CalendarioModel.findById(_id);

    if (!resultCalendario) {
        throw new AppError(
            "Partido No Encontrado",
            404,
            "service:updateCierreCalendarioService",
        );
    }

    // 2. Verifico que el Equipo A y B tengan ID
    if (!resultCalendario.idEquipoA) {
        throw new AppError(
            "Equipo A invalido",
            404,
            "service:updateCierreCalendarioService",
        );
    }

    if (!resultCalendario.idEquipoB) {
        throw new AppError(
            "Equipo B invalido",
            404,
            "service:updateCierreCalendarioService",
        );
    }

    // 3. CASO A: ABRIR (Solo actualizar estatus)
    if (statusJuego !== 2) {
        await CalendarioModel.findByIdAndUpdate(_id, {
            statusJuego: statusJuego,
        });

        return;
    }

    // 4. CASO B: CERRAR (Proceso Doble con Transacción)
    // Solo procedemos si la etapa estaba cerrada (para no duplicar pronósticos)
    if (statusJuego === 2 && resultCalendario.statusJuego !== 2) {
        const session = await mongoose.startSession();

        // Inicio la sesion
        session.startTransaction();

        try {
            // 🌟 OPTIMIZACIÓN: Instanciamos los ObjectIds UNA sola vez aquí afuera
            const calendarioObjectId = new Types.ObjectId(_id);
            const grupoObjectId = new Types.ObjectId(resultCalendario.idGrupo);
            const faseObjectId = new Types.ObjectId(resultCalendario.idFase);
            const equipoAObjectId = new Types.ObjectId(
                resultCalendario.idEquipoA,
            );
            const equipoBObjectId = new Types.ObjectId(
                resultCalendario.idEquipoB,
            );

            // PASO 4.1: Actualizar el estatus del partido (Calendario) a cerrado y sus goles reales
            let idGanador;

            if (golesEquipoA === golesEquipoB) {
                idGanador = null; // Hubo Empate, no hay ganador.
            } else {
                if (golesEquipoA > golesEquipoB) {
                    idGanador = equipoAObjectId?.toString() || "";
                } else {
                    idGanador = equipoBObjectId?.toString() || "";
                }
            }

            await CalendarioModel.findByIdAndUpdate(
                _id,
                {
                    statusJuego: statusJuego,
                    golesEquipoA: golesEquipoA,
                    golesEquipoB: golesEquipoB,
                    idGanador: idGanador,
                },
                { session },
            );

            // PASO 4.2: - Busco los datos de la clasificacion del Equipo A
            const resultClasificacionEquipoA = await ClasificacionModel.findOne(
                {
                    idGrupo: grupoObjectId,
                    idFase: faseObjectId,
                    idSeleccion: equipoAObjectId,
                },
            ).session(session);

            if (!resultClasificacionEquipoA) {
                throw new AppError(
                    "Equipo A No Encontrado",
                    404,
                    "service:updateCierreCalendarioService",
                );
            }

            let juegos_A = resultClasificacionEquipoA.juegos;
            let ganados_A = resultClasificacionEquipoA.ganados;
            let perdidos_A = resultClasificacionEquipoA.perdidos;
            let empatados_A = resultClasificacionEquipoA.empatados;
            let golesFavor_A = resultClasificacionEquipoA.golesFavor;
            let golesContra_A = resultClasificacionEquipoA.golesContra;
            let diferenciaGoles_A = resultClasificacionEquipoA.diferenciaGoles;
            let puntos_A = resultClasificacionEquipoA.puntos;

            // PASO 4.3: - Realizo los calculos para el Equipo A
            juegos_A = resultClasificacionEquipoA.juegos + 1;
            golesFavor_A = resultClasificacionEquipoA.golesFavor + golesEquipoA;
            golesContra_A =
                resultClasificacionEquipoA.golesContra + golesEquipoB;
            diferenciaGoles_A = golesFavor_A - golesContra_A;

            // Si hubo EMPATE
            if (idGanador === null) {
                empatados_A = resultClasificacionEquipoA.empatados + 1;
                puntos_A = resultClasificacionEquipoA.puntos + 1;
            } else {
                // Si GANO Equipo A
                if (idGanador === equipoAObjectId.toString()) {
                    ganados_A = resultClasificacionEquipoA.ganados + 1;
                    puntos_A = resultClasificacionEquipoA.puntos + 3;
                } else {
                    perdidos_A = resultClasificacionEquipoA.perdidos + 1;
                }
            }

            // PASO 4.4: - Actualizar Clasificacion de Equipo A
            await ClasificacionModel.findOneAndUpdate(
                {
                    idGrupo: grupoObjectId,
                    idFase: faseObjectId,
                    idSeleccion: equipoAObjectId,
                },
                {
                    juegos: juegos_A,
                    ganados: ganados_A,
                    perdidos: perdidos_A,
                    empatados: empatados_A,
                    golesFavor: golesFavor_A,
                    golesContra: golesContra_A,
                    diferenciaGoles: diferenciaGoles_A,
                    puntos: puntos_A,
                },
                { session },
            );

            // PASO 4.5: - Busco los datos de la clasificacion del Equipo B
            const resultClasificacionEquipoB = await ClasificacionModel.findOne(
                {
                    idGrupo: grupoObjectId,
                    idFase: faseObjectId,
                    idSeleccion: equipoBObjectId,
                },
            ).session(session);

            if (!resultClasificacionEquipoB) {
                throw new AppError(
                    "Equipo B No Encontrado",
                    404,
                    "service:updateCierreCalendarioService",
                );
            }

            let juegos_B = resultClasificacionEquipoB.juegos;
            let ganados_B = resultClasificacionEquipoB.ganados;
            let perdidos_B = resultClasificacionEquipoB.perdidos;
            let empatados_B = resultClasificacionEquipoB.empatados;
            let golesFavor_B = resultClasificacionEquipoB.golesFavor;
            let golesContra_B = resultClasificacionEquipoB.golesContra;
            let diferenciaGoles_B = resultClasificacionEquipoB.diferenciaGoles;
            let puntos_B = resultClasificacionEquipoB.puntos;

            // PASO 4.6: - Realizo los calculos para el Equipo B
            juegos_B = resultClasificacionEquipoB.juegos + 1;
            golesFavor_B = resultClasificacionEquipoB.golesFavor + golesEquipoB;
            golesContra_B =
                resultClasificacionEquipoB.golesContra + golesEquipoA;
            diferenciaGoles_B = golesFavor_B - golesContra_B;

            // Si hubo EMPATE
            if (idGanador === null) {
                empatados_B = resultClasificacionEquipoB.empatados + 1;
                puntos_B = resultClasificacionEquipoB.puntos + 1;
            } else {
                // Si GANO Equipo A
                if (idGanador === equipoBObjectId.toString()) {
                    ganados_B = resultClasificacionEquipoB.ganados + 1;
                    puntos_B = resultClasificacionEquipoB.puntos + 3;
                } else {
                    perdidos_B = resultClasificacionEquipoB.perdidos + 1;
                }
            }

            // PASO 4.7: - Actualizar Clasificacion de Equipo B
            await ClasificacionModel.findOneAndUpdate(
                {
                    idGrupo: grupoObjectId,
                    idFase: faseObjectId,
                    idSeleccion: equipoBObjectId,
                },
                {
                    juegos: juegos_B,
                    ganados: ganados_B,
                    perdidos: perdidos_B,
                    empatados: empatados_B,
                    golesFavor: golesFavor_B,
                    golesContra: golesContra_B,
                    diferenciaGoles: diferenciaGoles_B,
                    puntos: puntos_B,
                },
                { session },
            );

            // PASO 4.8: - Actualizar Ranking de Clasificacion del Grupo
            const clasificacionesGrupo = await ClasificacionModel.find({
                idGrupo: grupoObjectId,
                idFase: faseObjectId,
            }).session(session);

            if (!clasificacionesGrupo || clasificacionesGrupo.length === 0) {
                throw new AppError(
                    "Grupo o Fase No Encontrados",
                    404,
                    "service:updateCierreCalendarioService",
                );
            }

            // --- PASO 4.9: Traer todos los partidos del grupo para el desempate "Cara a Cara" ---
            const partidosCerradosGrupo = await CalendarioModel.find({
                idGrupo: grupoObjectId,
                idFase: faseObjectId,
                statusJuego: 2, // Solo tomamos en cuenta partidos ya terminados
            }).session(session);

            // --- PASO 4.10: Motor de ordenamiento (Lógica de Ranking) ---
            clasificacionesGrupo.sort((a, b) => {
                // Regla 1: Puntos (Mayor a menor)
                if (b.puntos !== a.puntos) return b.puntos - a.puntos;

                // Regla 2: Diferencia de Goles (Mayor a menor)
                if (b.diferenciaGoles !== a.diferenciaGoles)
                    return b.diferenciaGoles - a.diferenciaGoles;

                // Regla 3: Cara a Cara (Si empatan puntos y goles)
                const partidoDirecto = partidosCerradosGrupo.find(
                    (p) =>
                        (p.idEquipoA?.toString() ===
                            a.idSeleccion?.toString() &&
                            p.idEquipoB?.toString() ===
                                b.idSeleccion?.toString()) ||
                        (p.idEquipoA?.toString() ===
                            b.idSeleccion?.toString() &&
                            p.idEquipoB?.toString() ===
                                a.idSeleccion?.toString()),
                );

                if (partidoDirecto && partidoDirecto.idGanador) {
                    if (
                        partidoDirecto.idGanador.toString() ===
                        a.idSeleccion?.toString()
                    )
                        return -1;
                    if (
                        partidoDirecto.idGanador.toString() ===
                        b.idSeleccion?.toString()
                    )
                        return 1;
                }

                // Regla 4: Orden FIFA (Suponiendo un campo 'posicion' o 'ordenFifa' inicial)
                // Aquí usamos la posición que tenían inicialmente o un valor por defecto
                return (a.posicion || 99) - (b.posicion || 99);
            });

            // --- PASO 4.11: Persistir el nuevo ranking en la base de datos ---
            for (let i = 0; i < clasificacionesGrupo.length; i++) {
                const equipo = clasificacionesGrupo[i];
                const nuevoRanking = i + 1; // El índice 0 será el ranking 1

                await ClasificacionModel.findByIdAndUpdate(
                    equipo._id,
                    { ranking: nuevoRanking },
                    { session },
                );
            }

            // PASO 4.12: - Actualizar puntos por Pronostico por Usuario
            const resultPronostico = await PronosticoModel.find({
                idCalendario: calendarioObjectId,
                idFase: faseObjectId,
            })
                .populate({
                    path: "idUsuario",
                    match: { status: "activo" }, // Solo traemos usuarios activos
                })
                .session(session);

            // Filtramos en memoria: solo los que tengan usuario activo Y goles definidos
            const pronosticosValidos = resultPronostico.filter(
                (p) =>
                    p.idUsuario !== null &&
                    p.golesEquipoA !== null &&
                    p.golesEquipoB !== null,
            );

            // Ahora recorremos SOLO los válidos para actualizar los datos del pronostico
            if (pronosticosValidos.length > 0) {
                for (const pronostico of pronosticosValidos) {
                    // Obtenemos el ID del usuario (ya validamos que no sea null)
                    const usuarioObjectId = (pronostico.idUsuario as any)._id;

                    // limpio las variables
                    let puntosLogro = 0;
                    let puntosMarcadorA = 0;
                    let puntosMarcadorB = 0;
                    let puntosMarcadorExacto = 0;

                    // Regla: Logro (Ganador o Empate)
                    // Usamos una comparación segura: si ambos son null (empate), es un acierto.
                    const ganadorReal = idGanador
                        ? idGanador.toString()
                        : "EMPATE";

                    const ganadorPronosticado = pronostico.idGanador
                        ? pronostico.idGanador.toString()
                        : "EMPATE";

                    if (ganadorReal === ganadorPronosticado) {
                        puntosLogro = 3;
                    }

                    // Verifico puntos de marcadores individuales
                    // Verifico puntos del marcador de Euipo A
                    if (golesEquipoA === pronostico.golesEquipoA) {
                        puntosMarcadorA = 1;
                    }

                    // Verifico puntos del marcador de Euipo B
                    if (golesEquipoB === pronostico.golesEquipoB) {
                        puntosMarcadorB = 1;
                    }

                    // Verifico puntos del marcador Exacto (si acerto los gloes de A y B)
                    if (
                        golesEquipoA === pronostico.golesEquipoA &&
                        golesEquipoB === pronostico.golesEquipoB
                    ) {
                        puntosMarcadorExacto = 5;
                    }

                    // Calculo los puntos Totales
                    const puntosTotales =
                        puntosLogro +
                        puntosMarcadorA +
                        puntosMarcadorB +
                        puntosMarcadorExacto;

                    // Actualiza la tabla Pronostico
                    await PronosticoModel.findOneAndUpdate(
                        {
                            idUsuario: usuarioObjectId,
                            idFase: faseObjectId,
                            idCalendario: calendarioObjectId,
                        },
                        {
                            puntosLogro: puntosLogro,
                            puntosMarcadorA: puntosMarcadorA,
                            puntosMarcadorB: puntosMarcadorB,
                            puntosMarcadorExacto: puntosMarcadorExacto,
                            puntosTotales: puntosTotales,
                        },
                        { session },
                    );
                }
            }

            // =======================================================================
            // 🏆 ACTUALIZACIÓN DEL RANKING GLOBAL DE JUGADORES
            // =======================================================================

            // PASO 1: Obtener todos los usuarios del Ranking que estén ACTIVOS.
            const rankingsActuales = await RankingModel.aggregate([
                {
                    $lookup: {
                        from: "usuarios", // Nombre exacto de tu colección de usuarios
                        localField: "idUsuario",
                        foreignField: "_id",
                        as: "usuarioInfo",
                    },
                },
                { $unwind: "$usuarioInfo" },
                { $match: { "usuarioInfo.status": "activo" } },
                {
                    $project: {
                        _id: 1, // ID del documento Ranking
                        idUsuario: 1,
                        nombreUsuario: "$usuarioInfo.nombre", // Lo necesitamos para desempatar
                    },
                },
            ]).session(session);

            const usuariosActivosIds = rankingsActuales.map((r) => r.idUsuario);

            // PASO 2 y 3: Buscar pronósticos válidos, uniendo con Calendario para verificar statusJuego = 2.
            // Hacemos una SOLA consulta agrupada por usuario para sumar puntos y contar partidos.
            const statsPronosticos = await PronosticoModel.aggregate([
                {
                    // Filtramos pronósticos cerrados, con goles definidos y de usuarios activos
                    $match: {
                        idUsuario: { $in: usuariosActivosIds },
                        aceptaPronostico: false,
                        golesEquipoA: { $ne: null },
                        golesEquipoB: { $ne: null },
                    },
                },
                {
                    // Unimos con calendario para asegurar que el partido original esté cerrado
                    $lookup: {
                        from: "calendarios",
                        localField: "idCalendario",
                        foreignField: "_id",
                        as: "calendarioInfo",
                    },
                },
                { $unwind: "$calendarioInfo" },
                {
                    $match: { "calendarioInfo.statusJuego": 2 },
                },
                {
                    // PASO 3 y 4: Agrupamos por usuario, sumamos puntos y contamos partidos
                    $group: {
                        _id: "$idUsuario",
                        totalPuntos: { $sum: "$puntosTotales" },
                        cantPartidos: { $sum: 1 }, // Cada documento cuenta como 1 partido válido
                    },
                },
            ]).session(session);

            // Convertimos a un Map(Diccionario) para buscar súper rápido O(1)
            const statsMap = new Map();

            statsPronosticos.forEach((stat) => {
                statsMap.set(stat._id.toString(), stat);
            });

            // Combinamos la data del Ranking con los cálculos de los pronósticos
            const rankingParaOrdenar = rankingsActuales.map((r) => {
                const stats = statsMap.get(r.idUsuario.toString()) || {
                    totalPuntos: 0,
                    cantPartidos: 0,
                };

                return {
                    idRanking: r._id,
                    idUsuario: r.idUsuario,
                    nombreUsuario: r.nombreUsuario,
                    puntosTotales: stats.totalPuntos,
                    cantidadPartidos: stats.cantPartidos,
                };
            });

            // PASO 5: Motor de ordenamiento con tus reglas específicas
            rankingParaOrdenar.sort((a, b) => {
                // a) Ordenar por Puntos (Descendente: de mayor a menor)
                if (b.puntosTotales !== a.puntosTotales) {
                    return b.puntosTotales - a.puntosTotales;
                }

                // b) Si hay empate en puntos -> Ordenar por Cantidad de Partidos (Ascendente: Menos partidos primero)
                if (a.cantidadPartidos !== b.cantidadPartidos) {
                    return a.cantidadPartidos - b.cantidadPartidos;
                }

                // c) Si hay empate en puntos y partidos -> Ordenar por Nombre (Ascendente: A - Z)
                // Usamos localeCompare que es nativo y maneja perfectamente acentos y mayúsculas
                return a.nombreUsuario.localeCompare(b.nombreUsuario);
            });

            // PASO 5.d: Recorrer el array ya ordenado y actualizar la colección Ranking
            for (let i = 0; i < rankingParaOrdenar.length; i++) {
                const item = rankingParaOrdenar[i];
                const nuevaPosicion = i + 1; // El índice 0 será el Ranking 1

                await RankingModel.findByIdAndUpdate(
                    item.idRanking,
                    {
                        puntosTotales: item.puntosTotales,
                        cantidadPartidos: item.cantidadPartidos,
                        ranking: nuevaPosicion,
                    },
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
                "service:updateCierreCalendarioService",
            );
        } finally {
            session.endSession();
        }
    }

    return;
}

/* RESPALDO
export async function getProximosPartidosService(
    localDate: string,
): Promise<{ docs: ICalendario[] }> {
    let now = new Date();

    // Dividimos "2026-06-12" en partes numéricas.
    // Al armar el Date con números en vez de un string,
    // JavaScript usa tu zona horaria local obligatoriamente y NO retrasa el día.
    const [year, month, day] = localDate.split("-").map(Number);
    now = new Date(year, month - 1, day); // month es base 0, por eso month - 1

    // Definimos el inicio del día actual (00:00:00)
    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
    );

    // PASO 1: Buscar el primer día con partidos >= hoy
    const proximoPartido = await CalendarioModel.findOne({
        fecha: { $gte: startOfToday },
    })
        .sort({ fecha: 1 })
        .select("fecha"); // Solo necesitamos la fecha

    if (!proximoPartido) {
        return { docs: [] };
    }

    // Definimos el rango del "Día Objetivo"
    const targetDate = new Date(proximoPartido.fecha);
    const startOfTargetDay = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        0,
        0,
        0,
    );
    const endOfTargetDay = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        23,
        59,
        59,
        999,
    );

    // PASO 2: Traer todos los partidos de ESE día con todos sus cruces (Lookups)
    const results = await CalendarioModel.aggregate([
        {
            $match: {
                fecha: { $gte: startOfTargetDay, $lte: endOfTargetDay },
            },
        },
        { $sort: { fecha: 1, nroPartido: 1 } },
        // Lookups a las tablas relacionadas (Selecciones, Grupos, Sedes)
        {
            $lookup: {
                from: "selecciones",
                localField: "idEquipoA",
                foreignField: "_id",
                as: "eqA",
            },
        },
        {
            $lookup: {
                from: "selecciones",
                localField: "idEquipoB",
                foreignField: "_id",
                as: "eqB",
            },
        },
        {
            $lookup: {
                from: "grupos",
                localField: "idGrupo",
                foreignField: "_id",
                as: "grp",
            },
        },
        {
            $lookup: {
                from: "sedes",
                localField: "idSede",
                foreignField: "_id",
                as: "sde",
            },
        },
        // Proyección limpia sin idFase ni idGanador
        {
            $project: {
                _id: 1,
                nroPartido: 1,
                fecha: 1,
                golesEquipoA: 1,
                golesEquipoB: 1,
                statusJuego: 1,

                // Estructura idEquipoA limpia, idéntica al primer endpoint
                idEquipoA: {
                    $let: {
                        vars: { team: { $arrayElemAt: ["$eqA", 0] } },
                        in: {
                            $cond: {
                                if: {
                                    $eq: [{ $ifNull: ["$$team", null] }, null],
                                },
                                then: null,
                                else: {
                                    _id: "$$team._id",
                                    pais: "$$team.pais",
                                    codigo_iso: "$$team.codigo_iso",
                                    bandera_url: "$$team.bandera_url",
                                },
                            },
                        },
                    },
                },
                // Estructura idEquipoB limpia, idéntica al primer endpoint
                idEquipoB: {
                    $let: {
                        vars: { team: { $arrayElemAt: ["$eqB", 0] } },
                        in: {
                            $cond: {
                                if: {
                                    $eq: [{ $ifNull: ["$$team", null] }, null],
                                },
                                then: null,
                                else: {
                                    _id: "$$team._id",
                                    pais: "$$team.pais",
                                    codigo_iso: "$$team.codigo_iso",
                                    bandera_url: "$$team.bandera_url",
                                },
                            },
                        },
                    },
                },
                // Estructura idGrupo limpia
                idGrupo: {
                    $let: {
                        vars: { g: { $arrayElemAt: ["$grp", 0] } },
                        in: {
                            $cond: {
                                if: { $eq: [{ $ifNull: ["$$g", null] }, null] },
                                then: null,
                                else: {
                                    _id: "$$g._id",
                                    nombre: "$$g.nombre",
                                },
                            },
                        },
                    },
                },
                // Estructura idSede limpia
                idSede: {
                    $let: {
                        vars: { s: { $arrayElemAt: ["$sde", 0] } },
                        in: {
                            $cond: {
                                if: { $eq: [{ $ifNull: ["$$s", null] }, null] },
                                then: null,
                                else: {
                                    _id: "$$s._id",
                                    pais: "$$s.pais",
                                    ciudad: "$$s.ciudad",
                                    estadium: "$$s.estadium",
                                    capacidad: "$$s.capacidad",
                                },
                            },
                        },
                    },
                },
            },
        },
    ]);

    return {
        docs: results,
    };
}

*/
