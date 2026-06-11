import mongoose from "mongoose";
import { AppError } from "../utils/appError.js";
import { SedeModel } from "../models/sede.model.js";
import { ConfiguracionModel } from "../models/configuracion.model.js";
import { FaseModel } from "../models/fase.model.js";
import { GrupoModel } from "../models/grupo.model.js";
import { SeleccionModel } from "../models/seleccion.model.js";
import { ClasificacionModel } from "../models/clasificacion.model.js";
import { CalendarioModel } from "../models/calendario.model.js";
import type { IConfiguracion } from "../types/IConfiguracion.js";

export async function getConfiguracionService(): Promise<{
    docs: IConfiguracion[];
}> {
    const results = await ConfiguracionModel.find({});

    return {
        docs: results,
    };
}

export async function createSedesService(): Promise<string[]> {
    // Array de Sede
    const sedes = [
        {
            codigo: 1,
            pais: "México",
            ciudad: "Ciudad de México",
            estadium: "Estadio Azteca",
            capacidad: 83264,
            estadium_url: "",
        },
        {
            codigo: 2,
            pais: "México",
            ciudad: "Guadalajara",
            estadium: "Estadio Akron",
            capacidad: 46232,
            estadium_url: "",
        },
        {
            codigo: 3,
            pais: "México",
            ciudad: "Monterrey",
            estadium: "Estadio BBVA",
            capacidad: 51348,
            estadium_url: "",
        },
        {
            codigo: 4,
            pais: "Canadá",
            ciudad: "Vancouver",
            estadium: "Estadio BC Place",
            capacidad: 54500,
            estadium_url: "",
        },
        {
            codigo: 5,
            pais: "Canadá",
            ciudad: "Toronto",
            estadium: "BMO Field",
            capacidad: 30000,
            estadium_url: "",
        },
        {
            codigo: 6,
            pais: "EEUU",
            ciudad: "Nueva Jersey",
            estadium: "MetLife Stadium",
            capacidad: 82500,
            estadium_url: "",
        },
        {
            codigo: 7,
            pais: "EEUU",
            ciudad: "Los Ángeles",
            estadium: "SoFi Stadium",
            capacidad: 70000,
            estadium_url: "",
        },
        {
            codigo: 8,
            pais: "EEUU",
            ciudad: "Dallas",
            estadium: "AT&T Stadium",
            capacidad: 80000,
            estadium_url: "",
        },
        {
            codigo: 9,
            pais: "EEUU",
            ciudad: "Kansas City",
            estadium: "Arrowhead Stadium",
            capacidad: 76416,
            estadium_url: "",
        },
        {
            codigo: 10,
            pais: "EEUU",
            ciudad: "Houston",
            estadium: "NRG Stadium",
            capacidad: 71795,
            estadium_url: "",
        },
        {
            codigo: 11,
            pais: "EEUU",
            ciudad: "Atlanta",
            estadium: "Mercedes-Benz Stadium",
            capacidad: 71000,
            estadium_url: "",
        },
        {
            codigo: 12,
            pais: "EEUU",
            ciudad: "Boston",
            estadium: "Gillette Stadium",
            capacidad: 65878,
            estadium_url: "",
        },
        {
            codigo: 13,
            pais: "EEUU",
            ciudad: "Filadelfia",
            estadium: "Lincoln Financial Field",
            capacidad: 69596,
            estadium_url: "",
        },
        {
            codigo: 14,
            pais: "EEUU",
            ciudad: "Miami",
            estadium: "Hard Rock Stadium",
            capacidad: 75540,
            estadium_url: "",
        },
        {
            codigo: 15,
            pais: "EEUU",
            ciudad: "Seattle",
            estadium: "Lumen Field",
            capacidad: 68740,
            estadium_url: "",
        },
        {
            codigo: 16,
            pais: "EEUU",
            ciudad: "San Francisco",
            estadium: "Levi's Stadium",
            capacidad: 68500,
            estadium_url: "",
        },
    ];

    // Array acumulador de las sedes creadas
    const sedesCreadas: string[] = [];

    // Crea la sesion
    const session = await mongoose.startSession();

    // Inicio la sesion
    session.startTransaction();

    try {
        // Mapea los datos
        const sedesBulk = sedes.map((sede) => ({
            updateOne: {
                filter: {
                    pais: new RegExp(`^${sede.pais}$`, "i"),
                    ciudad: new RegExp(`^${sede.ciudad}$`, "i"),
                    estadium: new RegExp(`^${sede.estadium}$`, "i"),
                },
                update: { $setOnInsert: sede },
                upsert: true,
            },
        }));

        // Ejecuta BulkWrite
        if (sedesBulk.length > 0) {
            const resultado = await SedeModel.bulkWrite(sedesBulk, { session });

            // Si hubo inserciones, mapeamos los nombres desde nuestro array original
            if (resultado.upsertedCount > 0) {
                Object.keys(resultado.upsertedIds).forEach((index) => {
                    const idx = parseInt(index);

                    sedesCreadas.push(
                        `${sedes[idx].pais} - ${sedes[idx].ciudad} - ${sedes[idx].estadium}`,
                    );
                });

                // Actualiza tabla Configuracion
                // Usamos findOneAndUpdate con un filtro vacío {} para afectar al único registro que existirá
                await ConfiguracionModel.findOneAndUpdate(
                    {},
                    { $set: { flagSedes: true } },
                    {
                        session,
                        upsert: true, // Si no existe el registro de configuración, lo crea
                        //new: true, // se comenta porque no capturamos el resultado y no necesitamos el documento actualizado
                    },
                );
            }
        }

        // Hace el commit si todo está bien
        await session.commitTransaction();

        // Devolvemos la lista de sedes
        return sedesCreadas;
    } catch (error: any) {
        // Si algo falla en cualquier punto, NADA de lo anterior se guarda
        await session.abortTransaction();

        throw new AppError(
            "Error en transacción: " + error.message,
            500,
            "service:createSedesService",
        );
    } finally {
        session.endSession();
    }
}

export async function createFasesService(): Promise<string[]> {
    // Array de Fases
    const fases = [
        {
            nombre: "Fase de Grupos",
            iso_fase: "FG",
            orden: 1,
            faseAbierta: true,
        },
        {
            nombre: "Dieciseisavos de Final",
            iso_fase: "DF",
            orden: 2,
            faseAbierta: false,
        },
        {
            nombre: "Octavos de Final",
            iso_fase: "OF",
            orden: 3,
            faseAbierta: false,
        },
        {
            nombre: "Cuartos de Final",
            iso_fase: "CF",
            orden: 4,
            faseAbierta: false,
        },
        {
            nombre: "Semifinales",
            iso_fase: "SF",
            orden: 5,
            faseAbierta: false,
        },
        {
            nombre: "Tercer Puesto",
            iso_fase: "TP",
            orden: 6,
            faseAbierta: false,
        },
        {
            nombre: "Final",
            iso_fase: "F",
            orden: 7,
            faseAbierta: false,
        },
    ];

    // Array acumulador de las fases creadas
    const fasesCreadas: string[] = [];

    // Crea la sesion
    const session = await mongoose.startSession();

    // Inicio la sesion
    session.startTransaction();

    try {
        // Mapea los datos
        const fasesBulk = fases.map((fase) => ({
            updateOne: {
                filter: {
                    $or: [
                        { nombre: new RegExp(`^${fase.nombre}$`, "i") },
                        { iso_fase: new RegExp(`^${fase.iso_fase}$`, "i") },
                    ],
                },
                update: { $setOnInsert: fase },
                upsert: true,
            },
        }));

        // Ejecuta BulkWrite
        if (fasesBulk.length > 0) {
            const resultado = await FaseModel.bulkWrite(fasesBulk, { session });

            // Si hubo inserciones, mapeamos los nombres desde nuestro array original
            if (resultado.upsertedCount > 0) {
                Object.keys(resultado.upsertedIds).forEach((index) => {
                    const idx = parseInt(index);

                    fasesCreadas.push(
                        `${fases[idx].iso_fase} - ${fases[idx].nombre}`,
                    );
                });

                // Actualiza tabla Configuracion
                // Usamos findOneAndUpdate con un filtro vacío {} para afectar al único registro que existirá
                await ConfiguracionModel.findOneAndUpdate(
                    {},
                    { $set: { flagFases: true } },
                    {
                        session,
                        upsert: true, // Si no existe el registro de configuración, lo crea
                        //new: true, // se comenta porque no capturamos el resultado y no necesitamos el documento actualizado
                    },
                );
            }
        }

        // Hace el commit si todo está bien
        await session.commitTransaction();

        // Devolvemos la lista de fases
        return fasesCreadas;
    } catch (error: any) {
        // Si algo falla en cualquier punto, NADA de lo anterior se guarda
        await session.abortTransaction();

        throw new AppError(
            "Error en transacción: " + error.message,
            500,
            "service:createFasesService",
        );
    } finally {
        session.endSession();
    }
}

export async function createGruposService(): Promise<string[]> {
    // Array de Grupos
    const grupos = [
        { nombre: "Grupo A", iso_fase: "FG", orden: 1 },
        { nombre: "Grupo B", iso_fase: "FG", orden: 2 },
        { nombre: "Grupo C", iso_fase: "FG", orden: 3 },
        { nombre: "Grupo D", iso_fase: "FG", orden: 4 },
        { nombre: "Grupo E", iso_fase: "FG", orden: 5 },
        { nombre: "Grupo F", iso_fase: "FG", orden: 6 },
        { nombre: "Grupo G", iso_fase: "FG", orden: 7 },
        { nombre: "Grupo H", iso_fase: "FG", orden: 8 },
        { nombre: "Grupo I", iso_fase: "FG", orden: 9 },
        { nombre: "Grupo J", iso_fase: "FG", orden: 10 },
        { nombre: "Grupo K", iso_fase: "FG", orden: 11 },
        { nombre: "Grupo L", iso_fase: "FG", orden: 12 },
        { nombre: "Cruce 1", iso_fase: "DF", orden: 1 },
        { nombre: "Cruce 2", iso_fase: "DF", orden: 2 },
        { nombre: "Cruce 3", iso_fase: "DF", orden: 3 },
        { nombre: "Cruce 4", iso_fase: "DF", orden: 4 },
        { nombre: "Cruce 5", iso_fase: "DF", orden: 5 },
        { nombre: "Cruce 6", iso_fase: "DF", orden: 6 },
        { nombre: "Cruce 7", iso_fase: "DF", orden: 7 },
        { nombre: "Cruce 8", iso_fase: "DF", orden: 8 },
        { nombre: "Cruce 9", iso_fase: "DF", orden: 9 },
        { nombre: "Cruce 10", iso_fase: "DF", orden: 10 },
        { nombre: "Cruce 11", iso_fase: "DF", orden: 11 },
        { nombre: "Cruce 12", iso_fase: "DF", orden: 12 },
        { nombre: "Cruce 13", iso_fase: "DF", orden: 13 },
        { nombre: "Cruce 14", iso_fase: "DF", orden: 14 },
        { nombre: "Cruce 15", iso_fase: "DF", orden: 15 },
        { nombre: "Cruce 16", iso_fase: "DF", orden: 16 },
        { nombre: "Cruce 1", iso_fase: "OF", orden: 1 },
        { nombre: "Cruce 2", iso_fase: "OF", orden: 2 },
        { nombre: "Cruce 3", iso_fase: "OF", orden: 3 },
        { nombre: "Cruce 4", iso_fase: "OF", orden: 4 },
        { nombre: "Cruce 5", iso_fase: "OF", orden: 5 },
        { nombre: "Cruce 6", iso_fase: "OF", orden: 6 },
        { nombre: "Cruce 7", iso_fase: "OF", orden: 7 },
        { nombre: "Cruce 8", iso_fase: "OF", orden: 8 },
        { nombre: "Cruce 1", iso_fase: "CF", orden: 1 },
        { nombre: "Cruce 2", iso_fase: "CF", orden: 2 },
        { nombre: "Cruce 3", iso_fase: "CF", orden: 3 },
        { nombre: "Cruce 4", iso_fase: "CF", orden: 4 },
        { nombre: "Cruce 1", iso_fase: "SF", orden: 1 },
        { nombre: "Cruce 2", iso_fase: "SF", orden: 2 },
        { nombre: "Cruce 1", iso_fase: "TP", orden: 1 },
        { nombre: "Cruce 1", iso_fase: "F", orden: 1 },
    ];

    // Array acumulador de los grupos creados
    const gruposCreados: string[] = [];

    // 1 - Busca todas las Fases ordenadas
    const fases = await FaseModel.find({}).sort({ orden: 1 });

    // Verifica si existe la fase
    if (fases.length === 0) {
        throw new AppError(
            `⚠️ No se pudo crear los grupos porque no estan creadas las Fases.`,
            404,
            "service:createGruposService",
        );
    }

    // Crea la sesion
    const session = await mongoose.startSession();

    // Inicio la sesion
    session.startTransaction();

    try {
        // Mapea los datos
        const gruposBulk = grupos.map((grupo) => {
            // 1. Buscamos la fase correspondiente en el array que trajiste de la DB
            const faseEncontrada = fases.find(
                (item) =>
                    item.iso_fase?.toLowerCase() ===
                    grupo.iso_fase?.toLowerCase(),
            );

            // 2. Si no existe la fase (por si acaso), lanzamos error o manejamos el caso
            if (!faseEncontrada) {
                throw new AppError(
                    `La fase con ISO ${grupo?.iso_fase} no existe`,
                    400,
                    "service:createGruposService",
                );
            }

            return {
                updateOne: {
                    filter: {
                        nombre: new RegExp(`^${grupo.nombre}$`, "i"),
                        idFase: faseEncontrada._id,
                    },
                    update: {
                        $setOnInsert: {
                            nombre: grupo.nombre,
                            idFase: faseEncontrada._id,
                            iso_fase: grupo.iso_fase,
                            orden: grupo.orden,
                        },
                    },
                    upsert: true,
                },
            };
        });

        // Ejecuta BulkWrite
        if (gruposBulk.length > 0) {
            const resultado = await GrupoModel.bulkWrite(gruposBulk, {
                session,
            });

            if (resultado.upsertedCount > 0) {
                Object.keys(resultado.upsertedIds).forEach((index) => {
                    const idx = parseInt(index);
                    const grupoInfo = grupos[idx];

                    const faseInfo = fases.find(
                        (f) =>
                            f.iso_fase?.toLowerCase() ===
                            grupoInfo.iso_fase?.toLowerCase(),
                    );

                    gruposCreados.push(
                        `${grupoInfo.nombre} - ${faseInfo?.nombre}`,
                    );
                });

                // Actualiza tabla Configuracion
                // Usamos findOneAndUpdate con un filtro vacío {} para afectar al único registro que existirá
                await ConfiguracionModel.findOneAndUpdate(
                    {},
                    { $set: { flagGrupos: true } },
                    {
                        session,
                        upsert: true, // Si no existe el registro de configuración, lo crea
                        //new: true, // se comenta porque no capturamos el resultado y no necesitamos el documento actualizado
                    },
                );
            }
        }

        // Hace el commit si todo está bien
        await session.commitTransaction();

        // Devolvemos la lista de grupos
        return gruposCreados;
    } catch (error: any) {
        // Si algo falla en cualquier punto, NADA de lo anterior se guarda
        await session.abortTransaction();

        throw new AppError(
            "Error en transacción: " + error.message,
            500,
            "service:createGruposService",
        );
    } finally {
        session.endSession();
    }
}

export async function createSeleccionesService(): Promise<string[]> {
    // Array de Selecciones
    const selecciones = [
        {
            pais: "México",
            codigo_iso: "MEX",
            bandera_url: "mexico.webp",
        },
        {
            pais: "Sudáfrica",
            codigo_iso: "RSA",
            bandera_url: "sudafrica.webp",
        },
        {
            pais: "República de Corea",
            codigo_iso: "KOR",
            bandera_url: "korea.webp",
        },
        {
            pais: "República Checa",
            codigo_iso: "CZE",
            bandera_url: "republica-cheka.webp",
        },
        {
            pais: "Canadá",
            codigo_iso: "CAN",
            bandera_url: "canada.webp",
        },
        {
            pais: "Qatar",
            codigo_iso: "QAT",
            bandera_url: "qatar.webp",
        },
        {
            pais: "Suiza",
            codigo_iso: "SUI",
            bandera_url: "suiza.webp",
        },
        {
            pais: "Bosnia y Herzegovina",
            codigo_iso: "BIH",
            bandera_url: "bosnia-herzegovina.webp",
        },
        {
            pais: "Brasil",
            codigo_iso: "BRA",
            bandera_url: "brasil.webp",
        },
        {
            pais: "Marruecos",
            codigo_iso: "MAR",
            bandera_url: "marruecos.webp",
        },
        {
            pais: "Haití",
            codigo_iso: "HAI",
            bandera_url: "haiti.webp",
        },
        {
            pais: "Escocia",
            codigo_iso: "SCO",
            bandera_url: "escocia.webp",
        },
        {
            pais: "EEUU",
            codigo_iso: "USA",
            bandera_url: "eeuu.webp",
        },
        {
            pais: "Paraguay",
            codigo_iso: "PAR",
            bandera_url: "paraguay.webp",
        },
        {
            pais: "Australia",
            codigo_iso: "AUS",
            bandera_url: "australia.webp",
        },
        {
            pais: "Turquía",
            codigo_iso: "TUR",
            bandera_url: "turquia.webp",
        },
        {
            pais: "Alemania",
            codigo_iso: "GER",
            bandera_url: "alemania.webp",
        },
        {
            pais: "Curazao",
            codigo_iso: "CUW",
            bandera_url: "curacao.webp",
        },
        {
            pais: "Costa de Marfil",
            codigo_iso: "CIV",
            bandera_url: "costa-de-marfil.webp",
        },
        {
            pais: "Ecuador",
            codigo_iso: "ECU",
            bandera_url: "ecuador.webp",
        },
        {
            pais: "Países Bajos",
            codigo_iso: "NED",
            bandera_url: "holanda.webp",
        },
        {
            pais: "Japón",
            codigo_iso: "JPN",
            bandera_url: "japon.webp",
        },
        {
            pais: "Túnez",
            codigo_iso: "TUN",
            bandera_url: "tunez.webp",
        },
        {
            pais: "Suecia",
            codigo_iso: "SWE",
            bandera_url: "suecia.webp",
        },
        {
            pais: "Bélgica",
            codigo_iso: "BEL",
            bandera_url: "belgica.webp",
        },
        {
            pais: "Egipto",
            codigo_iso: "EGY",
            bandera_url: "egipto.webp",
        },
        {
            pais: "RI de Irán",
            codigo_iso: "IRN",
            bandera_url: "iran.webp",
        },
        {
            pais: "Nueva Zelanda",
            codigo_iso: "NZL",
            bandera_url: "nueva-zelanda.webp",
        },
        {
            pais: "España",
            codigo_iso: "ESP",
            bandera_url: "españa.webp",
        },
        {
            pais: "Islas de Cabo Verde",
            codigo_iso: "CPV",
            bandera_url: "islas-de-cabo-verde.webp",
        },
        {
            pais: "Arabia Saudí",
            codigo_iso: "KSA",
            bandera_url: "arabia-saudi.webp",
        },
        {
            pais: "Uruguay",
            codigo_iso: "URU",
            bandera_url: "uruguay.webp",
        },
        {
            pais: "Francia",
            codigo_iso: "FRA",
            bandera_url: "francia.webp",
        },
        {
            pais: "Senegal",
            codigo_iso: "SEN",
            bandera_url: "senegal.webp",
        },
        {
            pais: "Noruega",
            codigo_iso: "NOR",
            bandera_url: "noruega.webp",
        },
        {
            pais: "Irak",
            codigo_iso: "IRQ",
            bandera_url: "irak.webp",
        },
        {
            pais: "Argentina",
            codigo_iso: "ARG",
            bandera_url: "argentina.webp",
        },
        {
            pais: "Argelia",
            codigo_iso: "ALG",
            bandera_url: "argelia.webp",
        },
        {
            pais: "Austria",
            codigo_iso: "AUT",
            bandera_url: "austria.webp",
        },
        {
            pais: "Jordania",
            codigo_iso: "JOR",
            bandera_url: "jordania.webp",
        },
        {
            pais: "Portugal",
            codigo_iso: "POR",
            bandera_url: "portugal.webp",
        },
        {
            pais: "Uzbekistán",
            codigo_iso: "UZB",
            bandera_url: "uzbekistan.webp",
        },
        {
            pais: "Colombia",
            codigo_iso: "COL",
            bandera_url: "colombia.webp",
        },
        {
            pais: "Congo DR",
            codigo_iso: "DRC",
            bandera_url: "congo.webp",
        },
        {
            pais: "Inglaterra",
            codigo_iso: "ENG",
            bandera_url: "inglaterra.webp",
        },
        {
            pais: "Croacia",
            codigo_iso: "CRO",
            bandera_url: "croacia.webp",
        },
        {
            pais: "Ghana",
            codigo_iso: "GHA",
            bandera_url: "ghana.webp",
        },
        {
            pais: "Panamá",
            codigo_iso: "PAN",
            bandera_url: "panama.webp",
        },
    ];

    // Array acumulador de las selecciones creadas
    const seleccionesCreadas: string[] = [];

    // Crea la sesion
    const session = await mongoose.startSession();

    // Inicio la sesion
    session.startTransaction();

    try {
        // Mapea los datos
        const seleccionesBulk = selecciones.map((seleccion) => ({
            updateOne: {
                filter: {
                    $or: [
                        { pais: new RegExp(`^${seleccion.pais}$`, "i") },
                        {
                            codigo_iso: new RegExp(
                                `^${seleccion.codigo_iso}$`,
                                "i",
                            ),
                        },
                    ],
                },
                update: { $setOnInsert: seleccion },
                upsert: true,
            },
        }));

        // Ejecuta BulkWrite
        if (seleccionesBulk.length > 0) {
            const resultado = await SeleccionModel.bulkWrite(seleccionesBulk, {
                session,
            });

            // Si hubo inserciones, mapeamos los nombres desde nuestro array original
            if (resultado.upsertedCount > 0) {
                Object.keys(resultado.upsertedIds).forEach((index) => {
                    const idx = parseInt(index);

                    seleccionesCreadas.push(
                        `${selecciones[idx].codigo_iso} - ${selecciones[idx].pais}`,
                    );
                });

                // Actualiza tabla Configuracion
                // Usamos findOneAndUpdate con un filtro vacío {} para afectar al único registro que existirá
                await ConfiguracionModel.findOneAndUpdate(
                    {},
                    { $set: { flagSelecciones: true } },
                    {
                        session,
                        upsert: true, // Si no existe el registro de configuración, lo crea
                        //new: true, // se comenta porque no capturamos el resultado y no necesitamos el documento actualizado
                    },
                );
            }
        }

        // Hace el commit si todo está bien
        await session.commitTransaction();

        // Devolvemos la lista de sedes
        return seleccionesCreadas;
    } catch (error: any) {
        // Si algo falla en cualquier punto, NADA de lo anterior se guarda
        await session.abortTransaction();

        throw new AppError(
            "Error en transacción: " + error.message,
            500,
            "service:createSeleccionesService",
        );
    } finally {
        session.endSession();
    }
}

export async function createClasificacionService(): Promise<string[]> {
    // Array de Distribucion
    const distribucion = [
        {
            grupo: "Grupo A",
            iso_fase: "FG",
            pais: "México",
            posicion: 1,
        },
        {
            grupo: "Grupo A",
            iso_fase: "FG",
            pais: "Sudáfrica",
            posicion: 2,
        },
        {
            grupo: "Grupo A",
            iso_fase: "FG",
            pais: "República de Corea",
            posicion: 3,
        },
        {
            grupo: "Grupo A",
            iso_fase: "FG",
            pais: "República Checa",
            posicion: 4,
        },
        {
            grupo: "Grupo B",
            iso_fase: "FG",
            pais: "Canadá",
            posicion: 1,
        },
        {
            grupo: "Grupo B",
            iso_fase: "FG",
            pais: "Qatar",
            posicion: 2,
        },
        {
            grupo: "Grupo B",
            iso_fase: "FG",
            pais: "Suiza",
            posicion: 3,
        },
        {
            grupo: "Grupo B",
            iso_fase: "FG",
            pais: "Bosnia y Herzegovina",
            posicion: 4,
        },
        {
            grupo: "Grupo C",
            iso_fase: "FG",
            pais: "Brasil",
            posicion: 1,
        },
        {
            grupo: "Grupo C",
            iso_fase: "FG",
            pais: "Marruecos",
            posicion: 2,
        },
        {
            grupo: "Grupo C",
            iso_fase: "FG",
            pais: "Haití",
            posicion: 3,
        },
        {
            grupo: "Grupo C",
            iso_fase: "FG",
            pais: "Escocia",
            posicion: 4,
        },
        {
            grupo: "Grupo D",
            iso_fase: "FG",
            pais: "EEUU",
            posicion: 1,
        },
        {
            grupo: "Grupo D",
            iso_fase: "FG",
            pais: "Paraguay",
            posicion: 2,
        },
        {
            grupo: "Grupo D",
            iso_fase: "FG",
            pais: "Australia",
            posicion: 3,
        },
        {
            grupo: "Grupo D",
            iso_fase: "FG",
            pais: "Turquía",
            posicion: 4,
        },
        {
            grupo: "Grupo E",
            iso_fase: "FG",
            pais: "Alemania",
            posicion: 1,
        },
        {
            grupo: "Grupo E",
            iso_fase: "FG",
            pais: "Curazao",
            posicion: 2,
        },
        {
            grupo: "Grupo E",
            iso_fase: "FG",
            pais: "Costa de Marfil",
            posicion: 3,
        },
        {
            grupo: "Grupo E",
            iso_fase: "FG",
            pais: "Ecuador",
            posicion: 4,
        },
        {
            grupo: "Grupo F",
            iso_fase: "FG",
            pais: "Países Bajos",
            posicion: 1,
        },
        {
            grupo: "Grupo F",
            iso_fase: "FG",
            pais: "Japón",
            posicion: 2,
        },
        {
            grupo: "Grupo F",
            iso_fase: "FG",
            pais: "Túnez",
            posicion: 3,
        },
        {
            grupo: "Grupo F",
            iso_fase: "FG",
            pais: "Suecia",
            posicion: 4,
        },
        {
            grupo: "Grupo G",
            iso_fase: "FG",
            pais: "Bélgica",
            posicion: 1,
        },
        {
            grupo: "Grupo G",
            iso_fase: "FG",
            pais: "Egipto",
            posicion: 2,
        },
        {
            grupo: "Grupo G",
            iso_fase: "FG",
            pais: "RI de Irán",
            posicion: 3,
        },
        {
            grupo: "Grupo G",
            iso_fase: "FG",
            pais: "Nueva Zelanda",
            posicion: 4,
        },
        {
            grupo: "Grupo H",
            iso_fase: "FG",
            pais: "España",
            posicion: 1,
        },
        {
            grupo: "Grupo H",
            iso_fase: "FG",
            pais: "Islas de Cabo Verde",
            posicion: 2,
        },
        {
            grupo: "Grupo H",
            iso_fase: "FG",
            pais: "Arabia Saudí",
            posicion: 3,
        },
        {
            grupo: "Grupo H",
            iso_fase: "FG",
            pais: "Uruguay",
            posicion: 4,
        },
        {
            grupo: "Grupo I",
            iso_fase: "FG",
            pais: "Francia",
            posicion: 1,
        },
        {
            grupo: "Grupo I",
            iso_fase: "FG",
            pais: "Senegal",
            posicion: 2,
        },
        {
            grupo: "Grupo I",
            iso_fase: "FG",
            pais: "Noruega",
            posicion: 3,
        },
        {
            grupo: "Grupo I",
            iso_fase: "FG",
            pais: "Irak",
            posicion: 4,
        },
        {
            grupo: "Grupo J",
            iso_fase: "FG",
            pais: "Argentina",
            posicion: 1,
        },
        {
            grupo: "Grupo J",
            iso_fase: "FG",
            pais: "Argelia",
            posicion: 2,
        },
        {
            grupo: "Grupo J",
            iso_fase: "FG",
            pais: "Austria",
            posicion: 3,
        },
        {
            grupo: "Grupo J",
            iso_fase: "FG",
            pais: "Jordania",
            posicion: 4,
        },
        {
            grupo: "Grupo K",
            iso_fase: "FG",
            pais: "Portugal",
            posicion: 1,
        },
        {
            grupo: "Grupo K",
            iso_fase: "FG",
            pais: "Uzbekistán",
            posicion: 2,
        },
        {
            grupo: "Grupo K",
            iso_fase: "FG",
            pais: "Colombia",
            posicion: 3,
        },
        {
            grupo: "Grupo K",
            iso_fase: "FG",
            pais: "Congo DR",
            posicion: 4,
        },
        {
            grupo: "Grupo L",
            iso_fase: "FG",
            pais: "Inglaterra",
            posicion: 1,
        },
        {
            grupo: "Grupo L",
            iso_fase: "FG",
            pais: "Croacia",
            posicion: 2,
        },
        {
            grupo: "Grupo L",
            iso_fase: "FG",
            pais: "Ghana",
            posicion: 3,
        },
        {
            grupo: "Grupo L",
            iso_fase: "FG",
            pais: "Panamá",
            posicion: 4,
        },

        // Dieciseisavos de Final
        {
            grupo: "Cruce 1",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 1",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 2",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 2",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 3",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 3",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 4",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 4",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 5",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 5",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 6",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 6",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 7",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 7",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 8",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 8",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 9",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 9",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 10",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 10",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 11",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 11",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 12",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 12",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 13",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 13",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 14",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 14",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 15",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 15",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 16",
            iso_fase: "DF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 16",
            iso_fase: "DF",
            pais: null,
            posicion: 2,
        },

        // Octavos de Final
        {
            grupo: "Cruce 1",
            iso_fase: "OF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 1",
            iso_fase: "OF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 2",
            iso_fase: "OF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 2",
            iso_fase: "OF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 3",
            iso_fase: "OF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 3",
            iso_fase: "OF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 4",
            iso_fase: "OF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 4",
            iso_fase: "OF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 5",
            iso_fase: "OF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 5",
            iso_fase: "OF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 6",
            iso_fase: "OF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 6",
            iso_fase: "OF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 7",
            iso_fase: "OF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 7",
            iso_fase: "OF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 8",
            iso_fase: "OF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 8",
            iso_fase: "OF",
            pais: null,
            posicion: 2,
        },

        // Cuartos de Final
        {
            grupo: "Cruce 1",
            iso_fase: "CF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 1",
            iso_fase: "CF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 2",
            iso_fase: "CF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 2",
            iso_fase: "CF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 3",
            iso_fase: "CF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 3",
            iso_fase: "CF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 4",
            iso_fase: "CF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 4",
            iso_fase: "CF",
            pais: null,
            posicion: 2,
        },

        // Semifinal
        {
            grupo: "Cruce 1",
            iso_fase: "SF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 1",
            iso_fase: "SF",
            pais: null,
            posicion: 2,
        },
        {
            grupo: "Cruce 2",
            iso_fase: "SF",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 2",
            iso_fase: "SF",
            pais: null,
            posicion: 2,
        },

        // Tercer Puesto
        {
            grupo: "Cruce 1",
            iso_fase: "TP",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 1",
            iso_fase: "TP",
            pais: null,
            posicion: 2,
        },

        // Final
        {
            grupo: "Cruce 1",
            iso_fase: "F",
            pais: null,
            posicion: 1,
        },
        {
            grupo: "Cruce 1",
            iso_fase: "F",
            pais: null,
            posicion: 2,
        },
    ];

    // Array acumulador de los grupos creados
    const distribucionesCreadas: string[] = [];

    // 1 - Busca todas las Selecciones
    const selecciones = await SeleccionModel.find({});

    // Verifica si existen las selecciones
    if (selecciones.length === 0) {
        throw new AppError(
            `⚠️ No se pudo crear la distribucion de la clasificacion porque no estan creadas las Selecciones.`,
            404,
            "service:createClasificacionService",
        );
    }

    // 2 - Busca todas los Grupos ordenados
    const grupos = await GrupoModel.find({}).sort({ idFase: 1, orden: 1 });

    // Verifica si existen los grupos
    if (grupos.length === 0) {
        throw new AppError(
            `⚠️ No se pudo crear la distribucion de la clasificacion porque no estan creados los Grupos.`,
            404,
            "service:createClasificacionService",
        );
    }

    // Crea la sesion
    const session = await mongoose.startSession();

    // Inicio la sesion
    session.startTransaction();

    try {
        // Mapea los datos
        const distribucionBulk = distribucion.map((dist) => {
            let idSeleccion = null;

            // 1. Buscamos el ID de la seleccion
            if (dist.pais) {
                // Buscamos el pais correspondiente en el array que trajiste de la DB
                const seleccionEncontrada = selecciones.find(
                    (item) =>
                        item.pais?.toLowerCase() === dist.pais?.toLowerCase(),
                );

                // Si no existe el pais (por si acaso), lanzamos error o manejamos el caso
                if (!seleccionEncontrada) {
                    throw new AppError(
                        `La Seleccion de ${dist.pais} no existe`,
                        400,
                        "service:createClasificacionService",
                    );
                }

                idSeleccion = seleccionEncontrada._id;
            }

            // 2. Buscamos la fase correspondiente en el array que trajiste de la DB
            const grupoEncontrado = grupos.find(
                (item) =>
                    item.nombre?.toLowerCase() === dist.grupo?.toLowerCase() &&
                    item.iso_fase?.toLowerCase() ===
                        dist.iso_fase?.toLowerCase(),
            );

            // Si no existe el grupo (por si acaso), lanzamos error o manejamos el caso
            if (!grupoEncontrado) {
                throw new AppError(
                    `El Grupo ${dist.grupo} - ${dist.iso_fase} no existe`,
                    400,
                    "service:createClasificacionService",
                );
            }

            return {
                updateOne: {
                    filter: {
                        idGrupo: grupoEncontrado._id,
                        idSeleccion: idSeleccion,
                        posicion: dist.posicion,
                    },
                    update: {
                        $setOnInsert: {
                            idFase: grupoEncontrado.idFase,
                            idGrupo: grupoEncontrado._id,
                            idSeleccion: idSeleccion,
                            posicion: dist.posicion,
                            juegos: 0,
                            puntos: 0,
                            ganados: 0,
                            perdidos: 0,
                            empatados: 0,
                            golesFavor: 0,
                            golesContra: 0,
                            diferenciaGoles: 0,
                            ranking: 0,
                        },
                    },
                    upsert: true,
                },
            };
        });

        // Ejecuta BulkWrite
        if (distribucionBulk.length > 0) {
            const resultado = await ClasificacionModel.bulkWrite(
                distribucionBulk,
                {
                    session,
                },
            );

            if (resultado.upsertedCount > 0) {
                Object.keys(resultado.upsertedIds).forEach((index) => {
                    const idx = parseInt(index);

                    distribucionesCreadas.push(
                        `${distribucion[idx].grupo} - ${distribucion[idx].iso_fase} - ${distribucion[idx].pais || "Pendiente"}`,
                    );
                });

                // Actualiza tabla Configuracion
                // Usamos findOneAndUpdate con un filtro vacío {} para afectar al único registro que existirá
                await ConfiguracionModel.findOneAndUpdate(
                    {},
                    { $set: { flagClasificacion: true } },
                    {
                        session,
                        upsert: true, // Si no existe el registro de configuración, lo crea
                        //new: true, // se comenta porque no capturamos el resultado y no necesitamos el documento actualizado
                    },
                );
            }
        }

        // Hace el commit si todo está bien
        await session.commitTransaction();

        // Devolvemos la lista de grupos
        return distribucionesCreadas;
    } catch (error: any) {
        // Si algo falla en cualquier punto, NADA de lo anterior se guarda
        await session.abortTransaction();

        throw new AppError(
            "Error en transacción: " + error.message,
            500,
            "service:createClasificacionService",
        );
    } finally {
        session.endSession();
    }
}

export async function createCalendarioService(): Promise<string[]> {
    // Array de selecciones por grupo
    const calendario = [
        {
            nroPartido: 1,
            fecha: new Date("2026-06-11T19:00:00Z"), // formato ISO
            paisA: "México",
            paisB: "Sudáfrica",
            codigoSede: 1,
            grupo: "Grupo A",
            iso_fase: "FG",
        },
        {
            nroPartido: 2,
            fecha: new Date("2026-06-12T02:00:00Z"), // formato ISO
            paisA: "República de Corea",
            paisB: "República Checa",
            codigoSede: 2,
            grupo: "Grupo A",
            iso_fase: "FG",
        },
        {
            nroPartido: 3,
            fecha: new Date("2026-06-12T19:00:00Z"), // formato ISO
            paisA: "Canadá",
            paisB: "Bosnia y Herzegovina",
            codigoSede: 5,
            grupo: "Grupo B",
            iso_fase: "FG",
        },
        {
            nroPartido: 4,
            fecha: new Date("2026-06-13T01:00:00Z"), // formato ISO
            paisA: "EEUU",
            paisB: "Paraguay",
            codigoSede: 7,
            grupo: "Grupo D",
            iso_fase: "FG",
        },
        {
            nroPartido: 8,
            fecha: new Date("2026-06-13T19:00:00Z"), // formato ISO
            paisA: "Qatar",
            paisB: "Suiza",
            codigoSede: 16,
            grupo: "Grupo B",
            iso_fase: "FG",
        },
        {
            nroPartido: 7,
            fecha: new Date("2026-06-13T22:00:00Z"), // formato ISO
            paisA: "Brasil",
            paisB: "Marruecos",
            codigoSede: 6,
            grupo: "Grupo C",
            iso_fase: "FG",
        },
        {
            nroPartido: 5,
            fecha: new Date("2026-06-14T01:00:00Z"), // formato ISO
            paisA: "Haití",
            paisB: "Escocia",
            codigoSede: 12,
            grupo: "Grupo C",
            iso_fase: "FG",
        },
        {
            nroPartido: 6,
            fecha: new Date("2026-06-14T04:00:00Z"), // formato ISO
            paisA: "Australia",
            paisB: "Turquía",
            codigoSede: 4,
            grupo: "Grupo D",
            iso_fase: "FG",
        },
        {
            nroPartido: 9,
            fecha: new Date("2026-06-14T17:00:00Z"), // formato ISO
            paisA: "Alemania",
            paisB: "Curazao",
            codigoSede: 10,
            grupo: "Grupo E",
            iso_fase: "FG",
        },
        {
            nroPartido: 11,
            fecha: new Date("2026-06-14T20:00:00Z"), // formato ISO
            paisA: "Países Bajos",
            paisB: "Japón",
            codigoSede: 8,
            grupo: "Grupo F",
            iso_fase: "FG",
        },
        {
            nroPartido: 10,
            fecha: new Date("2026-06-14T23:00:00Z"), // formato ISO
            paisA: "Costa de Marfil",
            paisB: "Ecuador",
            codigoSede: 13,
            grupo: "Grupo E",
            iso_fase: "FG",
        },
        {
            nroPartido: 12,
            fecha: new Date("2026-06-15T02:00:00Z"), // formato ISO
            paisA: "Suecia",
            paisB: "Túnez",
            codigoSede: 3,
            grupo: "Grupo F",
            iso_fase: "FG",
        },
        {
            nroPartido: 14,
            fecha: new Date("2026-06-15T16:00:00Z"), // formato ISO
            paisA: "España",
            paisB: "Islas de Cabo Verde",
            codigoSede: 11,
            grupo: "Grupo H",
            iso_fase: "FG",
        },
        {
            nroPartido: 16,
            fecha: new Date("2026-06-15T19:00:00Z"), // formato ISO
            paisA: "Bélgica",
            paisB: "Egipto",
            codigoSede: 15,
            grupo: "Grupo G",
            iso_fase: "FG",
        },
        {
            nroPartido: 13,
            fecha: new Date("2026-06-15T22:00:00Z"), // formato ISO
            paisA: "Arabia Saudí",
            paisB: "Uruguay",
            codigoSede: 14,
            grupo: "Grupo H",
            iso_fase: "FG",
        },
        {
            nroPartido: 15,
            fecha: new Date("2026-06-16T01:00:00Z"), // formato ISO
            paisA: "RI de Irán",
            paisB: "Nueva Zelanda",
            codigoSede: 7,
            grupo: "Grupo G",
            iso_fase: "FG",
        },
        {
            nroPartido: 17,
            fecha: new Date("2026-06-16T19:00:00Z"), // formato ISO
            paisA: "Francia",
            paisB: "Senegal",
            codigoSede: 6,
            grupo: "Grupo I",
            iso_fase: "FG",
        },
        {
            nroPartido: 18,
            fecha: new Date("2026-06-16T22:00:00Z"), // formato ISO
            paisA: "Irak", // Bolivia BOL o Iraq IRQ
            paisB: "Noruega",
            codigoSede: 12,
            grupo: "Grupo I",
            iso_fase: "FG",
        },
        {
            nroPartido: 19,
            fecha: new Date("2026-06-17T01:00:00Z"), // formato ISO
            paisA: "Argentina",
            paisB: "Argelia",
            codigoSede: 9,
            grupo: "Grupo J",
            iso_fase: "FG",
        },
        {
            nroPartido: 20,
            fecha: new Date("2026-06-17T04:00:00Z"), // formato ISO
            paisA: "Austria",
            paisB: "Jordania",
            codigoSede: 16,
            grupo: "Grupo J",
            iso_fase: "FG",
        },
        {
            nroPartido: 23,
            fecha: new Date("2026-06-17T17:00:00Z"), // formato ISO
            paisA: "Portugal",
            paisB: "Congo DR", // Jamaica JAM o República Democrática del Congo DRC
            codigoSede: 10,
            grupo: "Grupo K",
            iso_fase: "FG",
        },
        {
            nroPartido: 22,
            fecha: new Date("2026-06-17T20:00:00Z"), // formato ISO
            paisA: "Inglaterra",
            paisB: "Croacia",
            codigoSede: 8,
            grupo: "Grupo L",
            iso_fase: "FG",
        },
        {
            nroPartido: 21,
            fecha: new Date("2026-06-17T23:00:00Z"), // formato ISO
            paisA: "Ghana",
            paisB: "Panamá",
            codigoSede: 5,
            grupo: "Grupo L",
            iso_fase: "FG",
        },
        {
            nroPartido: 24,
            fecha: new Date("2026-06-18T02:00:00Z"), // formato ISO
            paisA: "Uzbekistán",
            paisB: "Colombia",
            codigoSede: 1,
            grupo: "Grupo K",
            iso_fase: "FG",
        },
        {
            nroPartido: 25,
            fecha: new Date("2026-06-18T16:00:00Z"), // formato ISO
            paisA: "República Checa",
            paisB: "Sudáfrica",
            codigoSede: 11,
            grupo: "Grupo A",
            iso_fase: "FG",
        },
        {
            nroPartido: 26,
            fecha: new Date("2026-06-18T19:00:00Z"), // formato ISO
            paisA: "Suiza",
            paisB: "Bosnia y Herzegovina",
            codigoSede: 7,
            grupo: "Grupo B",
            iso_fase: "FG",
        },
        {
            nroPartido: 27,
            fecha: new Date("2026-06-18T22:00:00Z"), // formato ISO
            paisA: "Canadá",
            paisB: "Qatar",
            codigoSede: 4,
            grupo: "Grupo B",
            iso_fase: "FG",
        },
        {
            nroPartido: 28,
            fecha: new Date("2026-06-19T01:00:00Z"), // formato ISO
            paisA: "México",
            paisB: "República de Corea",
            codigoSede: 2,
            grupo: "Grupo A",
            iso_fase: "FG",
        },
        {
            nroPartido: 32,
            fecha: new Date("2026-06-19T19:00:00Z"), // formato ISO
            paisA: "EEUU",
            paisB: "Australia",
            codigoSede: 15,
            grupo: "Grupo D",
            iso_fase: "FG",
        },
        {
            nroPartido: 30,
            fecha: new Date("2026-06-19T22:00:00Z"), // formato ISO
            paisA: "Escocia",
            paisB: "Marruecos",
            codigoSede: 12,
            grupo: "Grupo C",
            iso_fase: "FG",
        },
        {
            nroPartido: 29,
            fecha: new Date("2026-06-20T01:00:00Z"), // formato ISO
            paisA: "Brasil",
            paisB: "Haití",
            codigoSede: 13,
            grupo: "Grupo C",
            iso_fase: "FG",
        },
        {
            nroPartido: 31,
            fecha: new Date("2026-06-20T04:00:00Z"), // formato ISO
            paisA: "Turquía",
            paisB: "Paraguay",
            codigoSede: 16,
            grupo: "Grupo D",
            iso_fase: "FG",
        },
        {
            nroPartido: 35,
            fecha: new Date("2026-06-20T17:00:00Z"), // formato ISO
            paisA: "Países Bajos",
            paisB: "Suecia",
            codigoSede: 10,
            grupo: "Grupo F",
            iso_fase: "FG",
        },
        {
            nroPartido: 33,
            fecha: new Date("2026-06-20T20:00:00Z"), // formato ISO
            paisA: "Alemania",
            paisB: "Costa de Marfil",
            codigoSede: 5,
            grupo: "Grupo E",
            iso_fase: "FG",
        },
        {
            nroPartido: 34,
            fecha: new Date("2026-06-20T24:00:00Z"), // formato ISO
            paisA: "Ecuador",
            paisB: "Curazao",
            codigoSede: 9,
            grupo: "Grupo E",
            iso_fase: "FG",
        },
        {
            nroPartido: 36,
            fecha: new Date("2026-06-21T04:00:00Z"), // formato ISO
            paisA: "Túnez",
            paisB: "Japón",
            codigoSede: 3,
            grupo: "Grupo F",
            iso_fase: "FG",
        },
        {
            nroPartido: 38,
            fecha: new Date("2026-06-21T16:00:00Z"), // formato ISO
            paisA: "España",
            paisB: "Arabia Saudí",
            codigoSede: 11,
            grupo: "Grupo H",
            iso_fase: "FG",
        },
        {
            nroPartido: 39,
            fecha: new Date("2026-06-21T19:00:00Z"), // formato ISO
            paisA: "Bélgica",
            paisB: "RI de Irán",
            codigoSede: 7,
            grupo: "Grupo G",
            iso_fase: "FG",
        },
        {
            nroPartido: 37,
            fecha: new Date("2026-06-21T22:00:00Z"), // formato ISO
            paisA: "Uruguay",
            paisB: "Islas de Cabo Verde",
            codigoSede: 14,
            grupo: "Grupo H",
            iso_fase: "FG",
        },
        {
            nroPartido: 40,
            fecha: new Date("2026-06-22T01:00:00Z"), // formato ISO
            paisA: "Nueva Zelanda",
            paisB: "Egipto",
            codigoSede: 4,
            grupo: "Grupo G",
            iso_fase: "FG",
        },
        {
            nroPartido: 43,
            fecha: new Date("2026-06-22T17:00:00Z"), // formato ISO
            paisA: "Argentina",
            paisB: "Austria",
            codigoSede: 8,
            grupo: "Grupo J",
            iso_fase: "FG",
        },
        {
            nroPartido: 42,
            fecha: new Date("2026-06-22T21:00:00Z"), // formato ISO
            paisA: "Francia",
            paisB: "Irak", // Bolivia BOL o Iraq IRQ
            codigoSede: 13,
            grupo: "Grupo I",
            iso_fase: "FG",
        },
        {
            nroPartido: 41,
            fecha: new Date("2026-06-22T24:00:00Z"), // formato ISO
            paisA: "Noruega",
            paisB: "Senegal",
            codigoSede: 6,
            grupo: "Grupo I",
            iso_fase: "FG",
        },
        {
            nroPartido: 44,
            fecha: new Date("2026-06-23T03:00:00Z"), // formato ISO
            paisA: "Jordania",
            paisB: "Argelia",
            codigoSede: 16,
            grupo: "Grupo J",
            iso_fase: "FG",
        },
        {
            nroPartido: 47,
            fecha: new Date("2026-06-23T17:00:00Z"), // formato ISO
            paisA: "Portugal",
            paisB: "Uzbekistán",
            codigoSede: 10,
            grupo: "Grupo K",
            iso_fase: "FG",
        },
        {
            nroPartido: 45,
            fecha: new Date("2026-06-23T20:00:00Z"), // formato ISO
            paisA: "Inglaterra",
            paisB: "Ghana",
            codigoSede: 12,
            grupo: "Grupo L",
            iso_fase: "FG",
        },
        {
            nroPartido: 46,
            fecha: new Date("2026-06-23T23:00:00Z"), // formato ISO
            paisA: "Panamá",
            paisB: "Croacia",
            codigoSede: 5,
            grupo: "Grupo L",
            iso_fase: "FG",
        },
        {
            nroPartido: 48,
            fecha: new Date("2026-06-24T02:00:00Z"), // formato ISO
            paisA: "Colombia",
            paisB: "Congo DR", // Jamaica JAM o República Democrática del Congo DRC
            codigoSede: 2,
            grupo: "Grupo K",
            iso_fase: "FG",
        },
        {
            nroPartido: 51,
            fecha: new Date("2026-06-24T19:00:00Z"), // formato ISO
            paisA: "Suiza",
            paisB: "Canadá",
            codigoSede: 4,
            grupo: "Grupo B",
            iso_fase: "FG",
        },
        {
            nroPartido: 52,
            fecha: new Date("2026-06-24T19:00:00Z"), // formato ISO
            paisA: "Bosnia y Herzegovina",
            paisB: "Qatar",
            codigoSede: 15,
            grupo: "Grupo B",
            iso_fase: "FG",
        },
        {
            nroPartido: 49,
            fecha: new Date("2026-06-24T22:00:00Z"), // formato ISO
            paisA: "Escocia",
            paisB: "Brasil",
            codigoSede: 14,
            grupo: "Grupo C",
            iso_fase: "FG",
        },
        {
            nroPartido: 50,
            fecha: new Date("2026-06-24T22:00:00Z"), // formato ISO
            paisA: "Marruecos",
            paisB: "Haití",
            codigoSede: 11,
            grupo: "Grupo C",
            iso_fase: "FG",
        },
        {
            nroPartido: 53,
            fecha: new Date("2026-06-25T01:00:00Z"), // formato ISO
            paisA: "República Checa",
            paisB: "México",
            codigoSede: 1,
            grupo: "Grupo A",
            iso_fase: "FG",
        },
        {
            nroPartido: 54,
            fecha: new Date("2026-06-25T01:00:00Z"), // formato ISO
            paisA: "Sudáfrica",
            paisB: "República de Corea",
            codigoSede: 3,
            grupo: "Grupo A",
            iso_fase: "FG",
        },
        {
            nroPartido: 55,
            fecha: new Date("2026-06-25T20:00:00Z"), // formato ISO
            paisA: "Curazao",
            paisB: "Costa de Marfil",
            codigoSede: 13,
            grupo: "Grupo E",
            iso_fase: "FG",
        },
        {
            nroPartido: 56,
            fecha: new Date("2026-06-25T20:00:00Z"), // formato ISO
            paisA: "Ecuador",
            paisB: "Alemania",
            codigoSede: 6,
            grupo: "Grupo E",
            iso_fase: "FG",
        },
        {
            nroPartido: 57,
            fecha: new Date("2026-06-25T23:00:00Z"), // formato ISO
            paisA: "Japón",
            paisB: "Suecia",
            codigoSede: 8,
            grupo: "Grupo F",
            iso_fase: "FG",
        },
        {
            nroPartido: 58,
            fecha: new Date("2026-06-25T23:00:00Z"), // formato ISO
            paisA: "Túnez",
            paisB: "Países Bajos",
            codigoSede: 9,
            grupo: "Grupo F",
            iso_fase: "FG",
        },
        {
            nroPartido: 59,
            fecha: new Date("2026-06-26T02:00:00Z"), // formato ISO
            paisA: "Turquía",
            paisB: "EEUU",
            codigoSede: 7,
            grupo: "Grupo D",
            iso_fase: "FG",
        },
        {
            nroPartido: 60,
            fecha: new Date("2026-06-26T02:00:00Z"), // formato ISO
            paisA: "Paraguay",
            paisB: "Australia",
            codigoSede: 16,
            grupo: "Grupo D",
            iso_fase: "FG",
        },
        {
            nroPartido: 61,
            fecha: new Date("2026-06-26T19:00:00Z"), // formato ISO
            paisA: "Noruega",
            paisB: "Francia",
            codigoSede: 12,
            grupo: "Grupo I",
            iso_fase: "FG",
        },
        {
            nroPartido: 62,
            fecha: new Date("2026-06-26T19:00:00Z"), // formato ISO
            paisA: "Senegal",
            paisB: "Irak", // Bolivia BOL o Iraq IRQ
            codigoSede: 5,
            grupo: "Grupo I",
            iso_fase: "FG",
        },
        {
            nroPartido: 65,
            fecha: new Date("2026-06-26T24:00:00Z"), // formato ISO
            paisA: "Islas de Cabo Verde",
            paisB: "Arabia Saudí",
            codigoSede: 10,
            grupo: "Grupo H",
            iso_fase: "FG",
        },
        {
            nroPartido: 66,
            fecha: new Date("2026-06-26T24:00:00Z"), // formato ISO
            paisA: "Uruguay",
            paisB: "España",
            codigoSede: 2,
            grupo: "Grupo H",
            iso_fase: "FG",
        },
        {
            nroPartido: 63,
            fecha: new Date("2026-06-27T03:00:00Z"), // formato ISO
            paisA: "Egipto",
            paisB: "RI de Irán",
            codigoSede: 15,
            grupo: "Grupo G",
            iso_fase: "FG",
        },
        {
            nroPartido: 64,
            fecha: new Date("2026-06-27T03:00:00Z"), // formato ISO
            paisA: "Nueva Zelanda",
            paisB: "Bélgica",
            codigoSede: 4,
            grupo: "Grupo G",
            iso_fase: "FG",
        },
        {
            nroPartido: 67,
            fecha: new Date("2026-06-27T21:00:00Z"), // formato ISO
            paisA: "Panamá",
            paisB: "Inglaterra",
            codigoSede: 6,
            grupo: "Grupo L",
            iso_fase: "FG",
        },
        {
            nroPartido: 68,
            fecha: new Date("2026-06-27T21:00:00Z"), // formato ISO
            paisA: "Croacia",
            paisB: "Ghana",
            codigoSede: 13,
            grupo: "Grupo L",
            iso_fase: "FG",
        },
        {
            nroPartido: 71,
            fecha: new Date("2026-06-27T23:30:00Z"), // formato ISO
            paisA: "Colombia",
            paisB: "Portugal",
            codigoSede: 14,
            grupo: "Grupo K",
            iso_fase: "FG",
        },
        {
            nroPartido: 72,
            fecha: new Date("2026-06-27T23:30:00Z"), // formato ISO
            paisA: "Congo DR", // Jamaica JAM o República Democrática del Congo DRC
            paisB: "Uzbekistán",
            codigoSede: 11,
            grupo: "Grupo K",
            iso_fase: "FG",
        },
        {
            nroPartido: 69,
            fecha: new Date("2026-06-28T02:00:00Z"), // formato ISO
            paisA: "Argelia",
            paisB: "Austria",
            codigoSede: 9,
            grupo: "Grupo J",
            iso_fase: "FG",
        },
        {
            nroPartido: 70,
            fecha: new Date("2026-06-28T02:00:00Z"), // formato ISO
            paisA: "Jordania",
            paisB: "Argentina",
            codigoSede: 8,
            grupo: "Grupo J",
            iso_fase: "FG",
        },

        // Deciseisavos de Final
        {
            nroPartido: 73,
            fecha: new Date("2026-06-28T19:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 7,
            grupo: "Cruce 1",
            iso_fase: "DF",
        },
        {
            nroPartido: 74,
            fecha: new Date("2026-06-29T17:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 10,
            grupo: "Cruce 2",
            iso_fase: "DF",
        },
        {
            nroPartido: 75,
            fecha: new Date("2026-06-29T20:30:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 12,
            grupo: "Cruce 3",
            iso_fase: "DF",
        },
        {
            nroPartido: 76,
            fecha: new Date("2026-06-30T01:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 3,
            grupo: "Cruce 4",
            iso_fase: "DF",
        },
        {
            nroPartido: 77,
            fecha: new Date("2026-06-30T17:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 8,
            grupo: "Cruce 5",
            iso_fase: "DF",
        },
        {
            nroPartido: 78,
            fecha: new Date("2026-06-30T21:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 6,
            grupo: "Cruce 6",
            iso_fase: "DF",
        },
        {
            nroPartido: 79,
            fecha: new Date("2026-07-01T01:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 1,
            grupo: "Cruce 7",
            iso_fase: "DF",
        },
        {
            nroPartido: 80,
            fecha: new Date("2026-07-01T16:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 11,
            grupo: "Cruce 8",
            iso_fase: "DF",
        },
        {
            nroPartido: 81,
            fecha: new Date("2026-07-01T20:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 15,
            grupo: "Cruce 9",
            iso_fase: "DF",
        },
        {
            nroPartido: 82,
            fecha: new Date("2026-07-01T24:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 16,
            grupo: "Cruce 10",
            iso_fase: "DF",
        },
        {
            nroPartido: 83,
            fecha: new Date("2026-07-02T19:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 7,
            grupo: "Cruce 11",
            iso_fase: "DF",
        },
        {
            nroPartido: 84,
            fecha: new Date("2026-07-02T23:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 5,
            grupo: "Cruce 12",
            iso_fase: "DF",
        },
        {
            nroPartido: 85,
            fecha: new Date("2026-07-03T03:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 4,
            grupo: "Cruce 13",
            iso_fase: "DF",
        },
        {
            nroPartido: 86,
            fecha: new Date("2026-07-03T18:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 8,
            grupo: "Cruce 14",
            iso_fase: "DF",
        },
        {
            nroPartido: 87,
            fecha: new Date("2026-07-03T22:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 14,
            grupo: "Cruce 15",
            iso_fase: "DF",
        },
        {
            nroPartido: 88,
            fecha: new Date("2026-07-04T01:30:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 9,
            grupo: "Cruce 16",
            iso_fase: "DF",
        },

        // Octavos de Final
        {
            nroPartido: 89,
            fecha: new Date("2026-07-04T14:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 10,
            grupo: "Cruce 1",
            iso_fase: "OF",
        },
        {
            nroPartido: 90,
            fecha: new Date("2026-07-04T21:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 13,
            grupo: "Cruce 2",
            iso_fase: "OF",
        },
        {
            nroPartido: 91,
            fecha: new Date("2026-07-05T20:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 6,
            grupo: "Cruce 3",
            iso_fase: "OF",
        },
        {
            nroPartido: 92,
            fecha: new Date("2026-07-05T24:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 1,
            grupo: "Cruce 4",
            iso_fase: "OF",
        },
        {
            nroPartido: 93,
            fecha: new Date("2026-07-06T19:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 8,
            grupo: "Cruce 5",
            iso_fase: "OF",
        },
        {
            nroPartido: 94,
            fecha: new Date("2026-07-06T24:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 15,
            grupo: "Cruce 6",
            iso_fase: "OF",
        },
        {
            nroPartido: 95,
            fecha: new Date("2026-07-07T16:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 11,
            grupo: "Cruce 7",
            iso_fase: "OF",
        },
        {
            nroPartido: 96,
            fecha: new Date("2026-07-07T20:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 4,
            grupo: "Cruce 8",
            iso_fase: "OF",
        },

        // Cuartos de Final
        {
            nroPartido: 97,
            fecha: new Date("2026-07-09T20:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 12,
            grupo: "Cruce 1",
            iso_fase: "CF",
        },
        {
            nroPartido: 98,
            fecha: new Date("2026-07-10T19:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 7,
            grupo: "Cruce 2",
            iso_fase: "CF",
        },
        {
            nroPartido: 99,
            fecha: new Date("2026-07-11T21:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 7,
            grupo: "Cruce 3",
            iso_fase: "CF",
        },
        {
            nroPartido: 100,
            fecha: new Date("2026-07-12T01:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 9,
            grupo: "Cruce 4",
            iso_fase: "CF",
        },

        // Semifinales
        {
            nroPartido: 101,
            fecha: new Date("2026-07-14T19:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 8,
            grupo: "Cruce 1",
            iso_fase: "SF",
        },
        {
            nroPartido: 102,
            fecha: new Date("2026-07-15T19:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 11,
            grupo: "Cruce 2",
            iso_fase: "SF",
        },

        // Tercer Puesto
        {
            nroPartido: 103,
            fecha: new Date("2026-07-18T21:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 14,
            grupo: "Cruce 1",
            iso_fase: "TP",
        },

        // Final
        {
            nroPartido: 104,
            fecha: new Date("2026-07-19T19:00:00Z"), // formato ISO
            paisA: null,
            paisB: null,
            codigoSede: 6,
            grupo: "Cruce 1",
            iso_fase: "F",
        },
    ];

    // Array acumulador de los grupos creados
    const calendarioCreado: string[] = [];

    // 1 - Busca todas las sedes
    const sedes = await SedeModel.find({});

    // Verifica si existen las sedes
    if (sedes.length === 0) {
        throw new AppError(
            `⚠️ No se pudo crear el Calendario porque no estan creadas las Sedes.`,
            404,
            "service:createCalendarioService",
        );
    }

    // 2 - Busca todas las Selecciones
    const selecciones = await SeleccionModel.find({});

    // Verifica si existen las selecciones
    if (selecciones.length === 0) {
        throw new AppError(
            `⚠️ No se pudo crear el Calendario porque no estan creadas las Selecciones.`,
            404,
            "service:createCalendarioService",
        );
    }

    // 3 - Busca todas los Grupos ordenados
    const grupos = await GrupoModel.find({}).sort({ idFase: 1, orden: 1 });

    // Verifica si existen los grupos
    if (grupos.length === 0) {
        throw new AppError(
            `⚠️ No se pudo crear el Calendario porque no estan creados los Grupos.`,
            404,
            "service:createCalendarioService",
        );
    }

    // Crea la sesion
    const session = await mongoose.startSession();

    // Inicio la sesion
    session.startTransaction();

    try {
        // Mapea los datos
        const calendarioBulk = calendario.map((juego) => {
            let idSeleccionA = null;
            let idSeleccionB = null;

            // 1. Buscamos el ID de la seleccion A
            if (juego.paisA) {
                // Buscamos el pais correspondiente en el array que trajiste de la DB
                const seleccionEncontradaA = selecciones.find(
                    (item) =>
                        item.pais?.toLowerCase() === juego.paisA?.toLowerCase(),
                );

                // Si no existe el pais (por si acaso), lanzamos error o manejamos el caso
                if (!seleccionEncontradaA) {
                    throw new AppError(
                        `La Seleccion de ${juego.paisA} no existe`,
                        400,
                        "service:createCalendarioService",
                    );
                }

                idSeleccionA = seleccionEncontradaA._id;
            }

            // 2. Buscamos el ID de la seleccion B
            if (juego.paisB) {
                // Buscamos el pais correspondiente en el array que trajiste de la DB
                const seleccionEncontradaB = selecciones.find(
                    (item) =>
                        item.pais?.toLowerCase() === juego.paisB?.toLowerCase(),
                );

                // Si no existe el pais (por si acaso), lanzamos error o manejamos el caso
                if (!seleccionEncontradaB) {
                    throw new AppError(
                        `La Seleccion de ${juego.paisB} no existe`,
                        400,
                        "service:createCalendarioService",
                    );
                }

                idSeleccionB = seleccionEncontradaB._id;
            }

            // 3. Buscamos la fase correspondiente en el array que trajiste de la DB
            const grupoEncontrado = grupos.find(
                (item) =>
                    item.nombre?.toLowerCase() === juego.grupo?.toLowerCase() &&
                    item.iso_fase?.toLowerCase() ===
                        juego.iso_fase?.toLowerCase(),
            );

            // Si no existe el grupo (por si acaso), lanzamos error o manejamos el caso
            if (!grupoEncontrado) {
                throw new AppError(
                    `El Grupo ${juego.grupo} - ${juego.iso_fase} no existe`,
                    400,
                    "service:createCalendarioService",
                );
            }

            // 4. Buscamos la fase correspondiente en el array que trajiste de la DB
            const sedeEncontrada = sedes.find(
                (item) => item.codigo === juego.codigoSede,
            );

            // Si no existe el grupo (por si acaso), lanzamos error o manejamos el caso
            if (!sedeEncontrada) {
                throw new AppError(
                    `La Sede ${juego.codigoSede} no existe`,
                    400,
                    "service:createCalendarioService",
                );
            }

            return {
                updateOne: {
                    filter: {
                        nroPartido: juego.nroPartido,
                        idFase: grupoEncontrado.idFase,
                    },
                    update: {
                        $setOnInsert: {
                            nroPartido: juego.nroPartido,
                            idFase: grupoEncontrado.idFase,
                            idGrupo: grupoEncontrado._id,
                            idEquipoA: idSeleccionA,
                            idEquipoB: idSeleccionB,
                            idSede: sedeEncontrada._id,
                            fecha: juego.fecha,
                            golesEquipoA: null,
                            golesEquipoB: null,
                            statusJuego: 0,
                            idGanador: null,
                        },
                    },
                    upsert: true,
                },
            };
        });

        // Ejecuta BulkWrite
        if (calendarioBulk.length > 0) {
            const resultado = await CalendarioModel.bulkWrite(calendarioBulk, {
                session,
            });

            if (resultado.upsertedCount > 0) {
                Object.keys(resultado.upsertedIds).forEach((index) => {
                    const idx = parseInt(index);

                    calendarioCreado.push(
                        `${calendario[idx].fecha.toISOString()} - ${calendario[idx].grupo} - ${calendario[idx].iso_fase} - ${calendario[idx].paisA || "Pendiente"} vs - ${calendario[idx].paisB || "Pendiente"}`,
                    );
                });

                // Actualiza tabla Configuracion
                // Usamos findOneAndUpdate con un filtro vacío {} para afectar al único registro que existirá
                await ConfiguracionModel.findOneAndUpdate(
                    {},
                    { $set: { flagCalendario: true } },
                    {
                        session,
                        upsert: true, // Si no existe el registro de configuración, lo crea
                        //new: true, // se comenta porque no capturamos el resultado y no necesitamos el documento actualizado
                    },
                );
            }
        }

        // Hace el commit si todo está bien
        await session.commitTransaction();

        // Devolvemos la lista de grupos
        return calendarioCreado;
    } catch (error: any) {
        // Si algo falla en cualquier punto, NADA de lo anterior se guarda
        await session.abortTransaction();

        throw new AppError(
            "Error en transacción: " + error.message,
            500,
            "service:createCalendarioService",
        );
    } finally {
        session.endSession();
    }
}
