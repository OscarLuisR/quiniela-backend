import type { PaginateResult } from "mongoose";
import type { IRanking } from "../types/IRanking.js";
import { RankingModel } from "../models/ranking.model.js";
import { AppError } from "../utils/appError.js";
import { CalendarioModel } from "../models/calendario.model.js";

export async function getRankingService(
    page: number,
    limit: number,
): Promise<{
    docs: IRanking[];
    pagination: Omit<PaginateResult<IRanking>, "docs">;
}> {
    const skip = (page - 1) * limit;

    const results = await RankingModel.aggregate([
        {
            $lookup: {
                from: "usuarios",
                localField: "idUsuario",
                foreignField: "_id",
                as: "usuarioData",
            },
        },
        { $unwind: "$usuarioData" },

        { $match: { "usuarioData.status": "activo" } },

        {
            $sort: {
                puntosTotales: -1,
                cantidadPartidos: 1,
                "usuarioData.nombre": 1,
            },
        },

        {
            $facet: {
                metadata: [{ $count: "totalDocs" }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        // AQUÍ AJUSTAMOS LA ESTRUCTURA A TU PETICIÓN
                        $project: {
                            _id: 1,
                            ranking: 1,
                            cantidadPartidos: 1,
                            puntosTotales: 1,
                            idUsuario: {
                                // Mantenemos el nombre idUsuario
                                _id: "$usuarioData._id",
                                nombre: "$usuarioData.nombre",
                                email: "$usuarioData.email",
                            },
                        },
                    },
                ],
            },
        },
    ]);

    const result = results[0];
    const docs = result.data;
    const totalDocs =
        result.metadata.length > 0 ? result.metadata[0].totalDocs : 0;
    const totalPages = Math.ceil(totalDocs / limit);

    return {
        docs: docs,
        pagination: {
            totalDocs,
            limit,
            page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
            pagingCounter: skip + 1,
        },
    };
}

export async function getRankingByIdService(
    idUsuario: string,
): Promise<IRanking | null> {
    // throw new AppError("ERROR LOCO", 404, "service:PRUEBA");

    const results = await RankingModel.findOne({ idUsuario: idUsuario });

    if (!results) {
        throw new AppError(
            "Usuario No Encontrado",
            404,
            "service:getRankingByIdService",
        );
    }

    return results;
}

export async function getRankingTop3Service(): Promise<{
    docs: IRanking[];
}> {
    // 1. Validar si existe al menos un partido cerrado (statusJuego = 2)
    const hayPartidosCerrados = await CalendarioModel.exists({
        statusJuego: 2,
    });

    // 2. Si no hay, retornamos el array vacío inmediatamente
    if (!hayPartidosCerrados) {
        return { docs: [] };
    }

    const results = await RankingModel.aggregate([
        {
            $lookup: {
                from: "usuarios",
                localField: "idUsuario",
                foreignField: "_id",
                as: "usuarioData",
            },
        },
        { $unwind: "$usuarioData" },

        { $match: { "usuarioData.status": "activo" } },

        {
            $sort: {
                puntosTotales: -1,
                cantidadPartidos: 1,
                "usuarioData.nombre": 1,
            },
        },
        { $limit: 3 },
        {
            // AQUÍ AJUSTAMOS LA ESTRUCTURA A TU PETICIÓN
            $project: {
                _id: 1,
                ranking: 1,
                cantidadPartidos: 1,
                puntosTotales: 1,
                idUsuario: {
                    // Mantenemos el nombre idUsuario
                    _id: "$usuarioData._id",
                    nombre: "$usuarioData.nombre",
                    email: "$usuarioData.email",
                },
            },
        },
    ]);

    return {
        docs: results,
    };
}
