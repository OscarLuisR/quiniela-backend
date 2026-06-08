import { GrupoModel } from "../models/grupo.model.js";
import type { IGrupo } from "../types/IGrupo.js";

export async function getGruposService(): Promise<{ docs: IGrupo[] }> {
    const results = await GrupoModel.find({}).sort({ idFase: 1, orden: 1 });

    return {
        docs: results,
    };
}

export async function getGruposByFaseService(
    _id: string,
): Promise<{ docs: IGrupo[] }> {
    const results = await GrupoModel.find({ idFase: _id }).sort({
        idFase: 1,
        orden: 1,
    });

    return {
        docs: results,
    };
}

// export async function createUserService(
//     data: IUsuarioRequest,
// ): Promise<IUsuario> {
//     // Verifica que no exista el nombre del usuario o el email. Para evitar duplicados
//     const findUser = await UsuarioModel.findOne({
//         $or: [
//             { nombre: new RegExp(`^${data.nombre}$`, "i") },
//             { email: new RegExp(`^${data.email}$`, "i") },
//         ],
//     });

//     if (findUser) {
//         if (findUser.nombre.toLowerCase() === data.nombre.toLowerCase()) {
//             throw new AppError(
//                 "El Nombre del Usuario ya Existe",
//                 409,
//                 "service:createUserService",
//             );
//         }

//         if (findUser.email.toLowerCase() === data.email.toLowerCase()) {
//             throw new AppError(
//                 "El Email ya Existe",
//                 409,
//                 "service:createUserService",
//             );
//         }
//     }

//     // Busca los datos del Rol Jugador
//     const rolFind = await RolModel.findOne({
//         nombre: new RegExp(`^${"Jugador"}$`, "i"),
//     });

//     // Verifica si se encontro el Rol Jugador
//     if (!rolFind) {
//         throw new AppError(
//             `⚠️ No se pudo crear el usuario ${data.nombre} porque no existe el rol 'Jugador'.`,
//             404,
//             "service:createUserService",
//         );
//     }

//     const resultCreate = await UsuarioModel.create({
//         nombre: data.nombre.trim(),
//         email: data.email.trim(),
//         status: "inactivo",
//         password: await encriptarPassword(
//             data.password,
//             "service:createUserService",
//         ),
//         idRol: rolFind._id,
//     });

//     const result = await resultCreate.populate({
//         path: "idRol",
//         model: RolModel,
//         select: "_id nombre",
//     });

//     return result;
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

// export async function updateUserService(
//     _id: string,
//     data: IUsuario,
// ): Promise<IUsuario> {
//     const resultById = await UsuarioModel.findById({ _id: _id });

//     if (!resultById) {
//         throw new AppError("Usuario No Encontrado", 404, "updateUserService");
//     }

//     // Verifico si existe otro usuario con el mismo nombre
//     if (data.nombre) {
//         const findnombre = await UsuarioModel.findOne({
//             nombre: new RegExp(`^${data.nombre}$`, "i"),
//             _id: { $ne: _id },
//         });

//         if (findnombre) {
//             throw new AppError(
//                 "El Nombre del Usuario ya esta en Uso",
//                 409,
//                 "updateUserService",
//             );
//         }
//     }

//     // Verifico si existe otro usuario con el mismo email
//     if (data.email) {
//         const findEmail = await UsuarioModel.findOne({
//             email: new RegExp(`^${data.email}$`, "i"),
//             _id: { $ne: _id },
//         });

//         if (findEmail) {
//             throw new AppError(
//                 "El Email del Usuario ya esta en Uso",
//                 409,
//                 "updateUserService",
//             );
//         }
//     }

//     // Verifico si se esta actualizando el password para encriptarlo
//     if (data.password) {
//         const password = await encriptarPassword(
//             data.password,
//             "updateUserService",
//         );

//         if (!password) {
//             throw new AppError(
//                 "No se pudo encriptar el password",
//                 404,
//                 "updateUserService",
//             );
//         }

//         data.password = password;
//     }

//     // Verifico si el rol asignado al usuario existe
//     if (data.idRol) {
//         // Verifico si el rol asignado al usuario existe
//         await buscaIdRol(data.idRol.toString(), "updateUserService");
//     }

//     // Actualiza el Usuario
//     const result = await UsuarioModel.findByIdAndUpdate({ _id: _id }, data, {
//         new: true,
//     }).populate({ path: "idRol", model: RolModel, select: "_id name" });

//     if (!result) {
//         throw new AppError("Usuario No Encontrado", 404, "updateUserService");
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
