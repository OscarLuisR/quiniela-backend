import mongoose, { type PaginateResult } from "mongoose";
import { PronosticoModel } from "../models/pronostico.model.js";
import type { IPronosticoRequest } from "../types/IPronosticoRequest.js";
import type { IPronostico } from "../types/IPronostico.js";
import { AppError } from "../utils/appError.js";
import { CalendarioModel } from "../models/calendario.model.js";

export async function getPronosticosByUserByFaseService(
    idUsuario: string,
    idFase: string,
): Promise<{ docs: IPronostico[] }> {
    const results = await PronosticoModel.aggregate([
        // 1. FILTRAR: Solo los pronósticos del usuario en la fase indicada
        {
            $match: {
                idUsuario: new mongoose.Types.ObjectId(idUsuario),
                idFase: new mongoose.Types.ObjectId(idFase),
            },
        },

        // 2. UNIR con Calendarios (para obtener la fecha y los IDs de referencia)
        {
            $lookup: {
                from: "calendarios", // Asegúrate que este nombre coincida con tu DB
                localField: "idCalendario",
                foreignField: "_id",
                as: "infoCalendario",
            },
        },
        // Convertimos el array de infoCalendario en un objeto plano
        { $unwind: "$infoCalendario" },

        // 3. ORDENAR: Por la fecha real del partido y su número cronológicamente
        {
            $sort: {
                "infoCalendario.fecha": 1,
                "infoCalendario.nroPartido": 1,
            },
        },

        // 4. LOOKUPS: Traer información descriptiva de otras colecciones
        {
            $lookup: {
                from: "selecciones",
                localField: "infoCalendario.idEquipoA",
                foreignField: "_id",
                as: "equipoA",
            },
        },
        {
            $lookup: {
                from: "selecciones",
                localField: "infoCalendario.idEquipoB",
                foreignField: "_id",
                as: "equipoB",
            },
        },
        {
            $lookup: {
                from: "sedes",
                localField: "infoCalendario.idSede",
                foreignField: "_id",
                as: "infoSede",
            },
        },
        {
            $lookup: {
                from: "grupos",
                localField: "infoCalendario.idGrupo",
                foreignField: "_id",
                as: "infoGrupo",
            },
        },

        // 5. PROYECCIÓN: Definimos los campos limpios de salida
        {
            $project: {
                _id: 1,
                golesEquipoA: 1, // Pronóstico del usuario
                golesEquipoB: 1, // Pronóstico del usuario
                idGanador: 1,
                puntosLogro: 1,
                puntosMarcadorA: 1,
                puntosMarcadorB: 1,
                puntosMarcadorExacto: 1,
                puntosTotales: 1,
                aceptaPronostico: 1,

                // Construimos un objeto 'partido' limpio
                partido: {
                    idCalendario: "$infoCalendario._id",
                    nroPartido: "$infoCalendario.nroPartido", // Incluido para coherencia con el sort
                    fecha: "$infoCalendario.fecha",
                    golesRealesA: "$infoCalendario.golesEquipoA",
                    golesRealesB: "$infoCalendario.golesEquipoB",
                    statusJuego: "$infoCalendario.statusJuego",

                    // Mapeo defensivo de equipoA
                    equipoA: {
                        $let: {
                            vars: { item: { $arrayElemAt: ["$equipoA", 0] } },
                            in: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            { $ifNull: ["$$item", null] },
                                            null,
                                        ],
                                    },
                                    then: null,
                                    else: {
                                        _id: "$$item._id",
                                        pais: "$$item.pais",
                                        bandera_url: "$$item.bandera_url",
                                        codigo_iso: "$$item.codigo_iso",
                                    },
                                },
                            },
                        },
                    },
                    // Mapeo defensivo de equipoB
                    equipoB: {
                        $let: {
                            vars: { item: { $arrayElemAt: ["$equipoB", 0] } },
                            in: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            { $ifNull: ["$$item", null] },
                                            null,
                                        ],
                                    },
                                    then: null,
                                    else: {
                                        _id: "$$item._id",
                                        pais: "$$item.pais",
                                        bandera_url: "$$item.bandera_url",
                                        codigo_iso: "$$item.codigo_iso",
                                    },
                                },
                            },
                        },
                    },
                    // Mapeo defensivo de sede (infoSede)
                    sede: {
                        $let: {
                            vars: { item: { $arrayElemAt: ["$infoSede", 0] } },
                            in: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            { $ifNull: ["$$item", null] },
                                            null,
                                        ],
                                    },
                                    then: null,
                                    else: {
                                        _id: "$$item._id",
                                        pais: "$$item.pais",
                                        ciudad: "$$item.ciudad",
                                        estadium: "$$item.estadium",
                                        capacidad: "$$item.capacidad",
                                    },
                                },
                            },
                        },
                    },
                    // Mapeo defensivo de grupo (infoGrupo)
                    grupo: {
                        $let: {
                            vars: { item: { $arrayElemAt: ["$infoGrupo", 0] } },
                            in: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            { $ifNull: ["$$item", null] },
                                            null,
                                        ],
                                    },
                                    then: null,
                                    else: {
                                        _id: "$$item._id",
                                        nombre: "$$item.nombre",
                                    },
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

export async function getPronosticosByFasePaginacionService(
    _id: string,
    page: number,
    limit: number,
    statusPronostico?: string,
): Promise<{
    docs: IPronostico[];
    pagination: Omit<PaginateResult<IPronostico>, "docs">;
}> {
    // Calculamos cuántos documentos saltar
    const skip = (page - 1) * limit;

    // 1. Construimos el filtro base (siempre filtramos por idFase)
    const matchFilter: any = {
        idFase: new mongoose.Types.ObjectId(_id),
    };

    // 2. Si el usuario envió un estatus ('abierto' o 'cerrado'), lo agregamos al filtro
    if (statusPronostico) {
        if (statusPronostico === "abierto") {
            matchFilter.aceptaPronostico = true;
        } else if (statusPronostico === "cerrado") {
            matchFilter.aceptaPronostico = false;
        }
    }

    const results = await PronosticoModel.aggregate([
        // 1. FILTRAR: Usamos nuestro matchFilter dinámico
        {
            $match: matchFilter,
        },

        // 2. UNIR con Calendarios para obtener la info del partido original
        {
            $lookup: {
                from: "calendarios",
                localField: "idCalendario",
                foreignField: "_id",
                as: "infoCalendario",
            },
        },
        { $unwind: "$infoCalendario" },

        // 3. AGRUPAR: Colapsamos la data por idCalendario para eliminar duplicados (cartesiano)
        {
            $group: {
                _id: "$idCalendario", // Agrupamos por el partido único

                // Retenemos el ID del primer pronóstico encontrado y sus campos
                pronosticoId: { $first: "$_id" },
                golesEquipoA: { $first: "$golesEquipoA" },
                golesEquipoB: { $first: "$golesEquipoB" },
                idGanador: { $first: "$idGanador" },
                puntosLogro: { $first: "$puntosLogro" },
                puntosMarcadorA: { $first: "$puntosMarcadorA" },
                puntosMarcadorB: { $first: "$puntosMarcadorB" },
                puntosMarcadorExacto: { $first: "$puntosMarcadorExacto" },
                puntosTotales: { $first: "$puntosTotales" },
                aceptaPronostico: { $first: "$aceptaPronostico" },

                // Pasamos la información del calendario al siguiente nivel
                infoCalendario: { $first: "$infoCalendario" },
            },
        },

        // 4. ORDENAR: Ahora que los partidos son únicos, los ordenamos cronológicamente
        {
            $sort: {
                "infoCalendario.fecha": 1,
                "infoCalendario.nroPartido": 1,
            },
        },

        // 5. EL FACET MÁGICO: Separa el conteo total de la data paginada
        {
            $facet: {
                // Flujo A: Cuenta los partidos únicos reales que quedaron tras el filtro y la agrupación
                metadata: [{ $count: "totalDocs" }],

                // Flujo B: Pagina y hace los lookups pesados (selecciones, sedes, etc.)
                data: [
                    // Aplicamos paginación sobre los registros ya únicos
                    { $skip: skip },
                    { $limit: limit },

                    // Lookups secundarios súper optimizados (solo se ejecutan para los N elementos de la página)
                    {
                        $lookup: {
                            from: "selecciones",
                            localField: "infoCalendario.idEquipoA",
                            foreignField: "_id",
                            as: "equipoA",
                        },
                    },
                    {
                        $lookup: {
                            from: "selecciones",
                            localField: "infoCalendario.idEquipoB",
                            foreignField: "_id",
                            as: "equipoB",
                        },
                    },
                    {
                        $lookup: {
                            from: "sedes",
                            localField: "infoCalendario.idSede",
                            foreignField: "_id",
                            as: "infoSede",
                        },
                    },
                    {
                        $lookup: {
                            from: "grupos",
                            localField: "infoCalendario.idGrupo",
                            foreignField: "_id",
                            as: "infoGrupo",
                        },
                    },

                    // 6. PROYECCIÓN FINAL ESTRUCTURADA Y HOMOLOGADA
                    {
                        $project: {
                            _id: "$pronosticoId", // Mantenemos el ID del pronóstico original en la raíz
                            golesEquipoA: 1,
                            golesEquipoB: 1,
                            idGanador: 1,
                            puntosLogro: 1,
                            puntosMarcadorA: 1,
                            puntosMarcadorB: 1,
                            puntosMarcadorExacto: 1,
                            puntosTotales: 1,
                            aceptaPronostico: 1,

                            partido: {
                                idCalendario: "$_id", // El _id del grupo es el idCalendario original
                                idFase: "$infoCalendario.idFase",
                                nroPartido: "$infoCalendario.nroPartido",
                                fecha: "$infoCalendario.fecha",
                                golesRealesA: "$infoCalendario.golesEquipoA",
                                golesRealesB: "$infoCalendario.golesEquipoB",
                                statusJuego: "$infoCalendario.statusJuego",

                                // Equipo A: Limpio o null
                                equipoA: {
                                    $let: {
                                        vars: {
                                            item: {
                                                $arrayElemAt: ["$equipoA", 0],
                                            },
                                        },
                                        in: {
                                            $cond: {
                                                if: {
                                                    $eq: [
                                                        {
                                                            $ifNull: [
                                                                "$$item",
                                                                null,
                                                            ],
                                                        },
                                                        null,
                                                    ],
                                                },
                                                then: null,
                                                else: {
                                                    _id: "$$item._id",
                                                    pais: "$$item.pais",
                                                    bandera_url:
                                                        "$$item.bandera_url",
                                                    codigo_iso:
                                                        "$$item.codigo_iso",
                                                },
                                            },
                                        },
                                    },
                                },
                                // Equipo B: Limpio o null
                                equipoB: {
                                    $let: {
                                        vars: {
                                            item: {
                                                $arrayElemAt: ["$equipoB", 0],
                                            },
                                        },
                                        in: {
                                            $cond: {
                                                if: {
                                                    $eq: [
                                                        {
                                                            $ifNull: [
                                                                "$$item",
                                                                null,
                                                            ],
                                                        },
                                                        null,
                                                    ],
                                                },
                                                then: null,
                                                else: {
                                                    _id: "$$item._id",
                                                    pais: "$$item.pais",
                                                    bandera_url:
                                                        "$$item.bandera_url",
                                                    codigo_iso:
                                                        "$$item.codigo_iso",
                                                },
                                            },
                                        },
                                    },
                                },
                                // Sede: Limpia o null
                                sede: {
                                    $let: {
                                        vars: {
                                            item: {
                                                $arrayElemAt: ["$infoSede", 0],
                                            },
                                        },
                                        in: {
                                            $cond: {
                                                if: {
                                                    $eq: [
                                                        {
                                                            $ifNull: [
                                                                "$$item",
                                                                null,
                                                            ],
                                                        },
                                                        null,
                                                    ],
                                                },
                                                then: null,
                                                else: {
                                                    _id: "$$item._id",
                                                    pais: "$$item.pais",
                                                    ciudad: "$$item.ciudad",
                                                    estadium: "$$item.estadium",
                                                    capacidad:
                                                        "$$item.capacidad",
                                                },
                                            },
                                        },
                                    },
                                },
                                // Grupo: Limpio o null
                                grupo: {
                                    $let: {
                                        vars: {
                                            item: {
                                                $arrayElemAt: ["$infoGrupo", 0],
                                            },
                                        },
                                        in: {
                                            $cond: {
                                                if: {
                                                    $eq: [
                                                        {
                                                            $ifNull: [
                                                                "$$item",
                                                                null,
                                                            ],
                                                        },
                                                        null,
                                                    ],
                                                },
                                                then: null,
                                                else: {
                                                    _id: "$$item._id",
                                                    nombre: "$$item.nombre",
                                                },
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

    // 7. EXTRACCIÓN Y CÁLCULO MANUAL DE PAGINACIÓN
    const result = results[0];
    const docs = result.data;

    const totalDocs =
        result.metadata.length > 0 ? result.metadata[0].totalDocs : 0;

    const totalPages = Math.ceil(totalDocs / limit);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

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

export async function updatePronosticosService(
    _id: string,
    golesEquipoA: number,
    golesEquipoB: number,
    idGanador: string | null,
): Promise<any> {
    // 1. Buscamos el pronóstico por su ID en la base de datos
    const pronosticoDb = await PronosticoModel.findById(_id);

    if (!pronosticoDb) {
        throw new AppError(
            "Partido No Encontrado",
            404,
            "service:updatePronosticosService",
        );
    }

    // 2. Regla de Negocio: Validar si el partido acepta pronósticos
    if (!pronosticoDb.aceptaPronostico) {
        throw new AppError(
            "El partido ya no acepta pronósticos",
            403,
            "service:updatePronosticosService",
        );
    }

    // 3. Buscamos el calendario del partido en la base de datos
    const calendarioDb = await CalendarioModel.findById(
        pronosticoDb.idCalendario,
    );

    if (!calendarioDb) {
        throw new AppError(
            "Partido No Registrado en el Calendario",
            404,
            "service:updatePronosticosService",
        );
    }

    // 4. Regla de Negocio: Validar si el partido acepta pronósticos
    if (calendarioDb.statusJuego !== 0) {
        throw new AppError(
            "Partido ya empezo o esta cerrado",
            403,
            "service:updatePronosticosService",
        );
    }

    // 5. Si pasa la validación, actualizamos el documento
    const resultado = await PronosticoModel.updateOne(
        { _id: _id },
        {
            $set: {
                golesEquipoA: golesEquipoA,
                golesEquipoB: golesEquipoB,
                idGanador: idGanador,
            },
        },
    );

    return resultado;
}

export async function updatePronosticoStatusService(
    idCalendario: string,
    idFase: string,
    aceptaPronostico: boolean,
): Promise<void> {
    await PronosticoModel.updateMany(
        {
            // 1. El Filtro: Qué documentos queremos afectar
            idCalendario: idCalendario,
            idFase: idFase,
        },
        {
            // 2. La Actualización: Qué campos vamos a cambiar
            aceptaPronostico: aceptaPronostico,
        },
    );

    return;
}
