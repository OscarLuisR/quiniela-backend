import mongoose from "mongoose";
import { encriptarPassword } from "../utils/funcionesGlobales.js";
import { UsuarioModel } from "../models/usuario.model.js";
import { RolModel } from "../models/rol.model.js";
import { AppError } from "../utils/appError.js";
import { ConfiguracionModel } from "../models/configuracion.model.js";

export async function cargaDataInicial() {
    try {
        console.log(`[ ⏳ ] Cargando datos iniciales en ...`);

        await creaRoles();

        await creaUsuarioAdmin();

        console.log(`[ ☑️ ] Datos iniciales cargados.`);
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // relanza el mismo AppError con statusCode y location
        } else {
            throw new AppError(
                "❌ Error desconocido al crear los datos iniciales",
                500,
                "seed:cargaDataInicial",
            );
        }
    }
}

async function creaRoles() {
    console.log(`[ 🔄 ] 1 - Verificando Roles ...`);

    // Array de Roles
    const roles = ["Admin", "Jugador"];

    // Array acumulador de las sedes creadas
    const rolesCreados: string[] = [];

    // Crea la sesion
    const session = await mongoose.startSession();

    // Inicio la sesion
    session.startTransaction();

    try {
        // Mapea los datos
        const rolesBulk = roles.map((rol) => ({
            updateOne: {
                filter: {
                    nombre: new RegExp(`^${rol}$`, "i"),
                },
                update: { $setOnInsert: { nombre: rol } },
                upsert: true,
            },
        }));

        // Ejecuta BulkWrite
        if (rolesBulk.length > 0) {
            const resultado = await RolModel.bulkWrite(rolesBulk, { session });

            // Si hubo inserciones, mapeamos los nombres desde nuestro array original
            if (resultado.upsertedCount > 0) {
                Object.keys(resultado.upsertedIds).forEach((index) => {
                    const idx = parseInt(index);

                    rolesCreados.push(`${roles[idx]}`);
                });

                // Actualiza tabla Configuracion
                // Usamos findOneAndUpdate con un filtro vacío {} para afectar al único registro que existirá
                await ConfiguracionModel.findOneAndUpdate(
                    {},
                    { $set: { flagRoles: true } },
                    {
                        session,
                        upsert: true, // Si no existe el registro de configuración, lo crea
                        returnDocument: "after", // <--- Esta es la forma moderna de decir "new: true"
                    },
                );
            }
        }

        // Hace el commit si todo está bien
        await session.commitTransaction();

        if (rolesCreados.length > 0) {
            console.log(
                `✔️  Se crearon con éxito los Roles: ${rolesCreados.join(", ")}.`,
            );
        } else {
            console.log(`✔️  No se crearon Roles nuevos (ya existen).`);
        }

        // Devolvemos la lista de sedes
        return rolesCreados;
    } catch (error: any) {
        // Si algo falla en cualquier punto, NADA de lo anterior se guarda
        await session.abortTransaction();

        throw new AppError(
            "Error en transacción: " + error.message,
            500,
            "seed:creaRoles",
        );
    } finally {
        session.endSession();
    }
}

async function creaUsuarioAdmin() {
    console.log(`[ 🔄 ] 2 - Verificando Usuario Administrador ...`);

    // 1 - Busca los datos del Rol Administrdor
    const rolFind = await RolModel.findOne({
        nombre: new RegExp(`^${"Admin"}$`, "i"),
    });

    // Verifica si se encontro el Rol Administrador
    if (!rolFind) {
        throw new AppError(
            "⚠️ No se pudo crear el usuario 'Admin' porque no existe el rol 'Admin'.",
            404,
            "seed:creaUsuarioAdmin",
        );
    }

    // Crea la sesion
    const session = await mongoose.startSession();

    // Inicio la sesion
    session.startTransaction();

    try {
        // 2 - Intento de inserción con upsert (Idempotente)
        const emailAdmin = "admin@admin.com";
        const passwordHasheada = await encriptarPassword(
            "admin",
            "creaUsuarioAdmin",
        );

        // Usamos findOneAndUpdate con upsert para evitar el "if (!userFind)" manual
        const resultado = await UsuarioModel.findOneAndUpdate(
            { email: new RegExp(`^${emailAdmin}$`, "i") },
            {
                $setOnInsert: {
                    nombre: "Admin",
                    email: emailAdmin,
                    status: "activo",
                    password: passwordHasheada,
                    idRol: rolFind._id,
                },
            },
            {
                session,
                upsert: true,
                returnDocument: "after", // <--- Esta es la forma moderna de decir "new: true"
                includeResultMetadata: true,
            },
        );

        // Verificamos si hubo una inserción (upsert)
        const fueInsertado = resultado.lastErrorObject?.upserted;

        // 3 - Si se insertó un nuevo usuario (upserted)
        if (fueInsertado) {
            await ConfiguracionModel.findOneAndUpdate(
                {},
                { $set: { flagUsers: true } },
                { session, upsert: true },
            );
            console.log("🛠️  Usuario 'Admin' creado con éxito.");
        } else {
            console.log("✔️  Usuario 'Admin' ya existe.");
        }

        // Commit de la transacción
        await session.commitTransaction();
    } catch (error: any) {
        await session.abortTransaction();

        if (error instanceof AppError) throw error;

        throw new AppError(
            `❌ Error al crear usuario Admin: ${error.message}`,
            500,
            "seed:creaUsuarioAdmin",
        );
    } finally {
        session.endSession();
    }
}
