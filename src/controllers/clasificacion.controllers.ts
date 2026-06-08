import type { NextFunction, Request, Response } from "express";
import { getClasificacionByFaseGrupoService } from "../services/clasificacion.services.js";
import { AppError } from "../utils/appError.js";

// export async function getGruposController(
//     req: Request,
//     res: Response,
//     next: NextFunction,
// ): Promise<void> {
//     const results = await getGruposService();

//     res.status(200).json({
//         error: false,
//         status: 200,
//         message: "Ok",
//         data: results.docs,
//         pagination: null,
//     });
// }

export async function getClasificacionByFaseGrupoController(
    // req: Request<{ _id: string }>,
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    // 1. Desestructuras con 'as any' para evitar el error de string[]
    const { idFase, idGrupo } = req.params as any;

    const results = await getClasificacionByFaseGrupoService(idFase, idGrupo);

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: null,
    });
}

// export async function createUserController(
//     req: Request,
//     res: Response,
//     next: NextFunction,
// ): Promise<void> {
//     const result = await createUserService(req.body);

//     res.status(201).json({
//         error: false,
//         status: 201,
//         message: "Ok",
//         data: result,
//         pagination: null,
//     });
// }

// export async function getUserIdController(
//     req: Request,
//     res: Response,
//     next: NextFunction,
// ): Promise<void> {
//     const result = await getUserIdService(req.params._id);

//     res.status(200).json({
//         error: false,
//         status: 200,
//         message: "Ok",
//         data: result,
//         pagination: null,
//     });
// }

// export async function updateUserController(
//     req: Request,
//     res: Response,
//     next: NextFunction,
// ): Promise<void> {
//     const result = await updateUserService(req.params._id, req.body);

//     res.status(200).json({
//         error: false,
//         status: 200,
//         message: "Ok",
//         data: result,
//         pagination: null,
//     });
// }

// export async function deleteUserController(
//     req: Request,
//     res: Response,
//     next: NextFunction,
// ): Promise<void> {
//     await deleteUserService(req.params._id);

//     res.status(200).json({
//         error: false,
//         status: 200,
//         message: "Usuario eliminado",
//         data: null,
//         pagination: null,
//     });
// }

// ctrl.resetPasswordUser = async (req, res) => {
//     const { id } = req.params;

//     try {
//         // Validar que no se resetee la clave del los usuario owner ni admin (verificar ID)
//         if (id == 1 || id == 2) {
//             return res.status(400).json({
//                 error: true,
//                 status: 400,
//                 message: `No se pude resetear el password de los usuarios Owner o Admin.`,
//             });
//         }

//         // Verifica si existe el usuario
//         const findUser = await Db.userModel.findOne({ where: { id: id } });

//         // Si no existe, se rechaza la peticion
//         if (!findUser) {
//             return res.status(400).json({
//                 error: true,
//                 status: 400,
//                 message: `No se pudo realizar el proceso, el usuario no existe.`,
//             });
//         }

//         // Encripta la clave
//         const password = await funciones.encriptarPassword("00000000");

//         const results = await Db.userModel.update(
//             { password: password, new_user: true },
//             { where: { id: findUser.id } },
//         );

//         return res.status(200).json({
//             error: false,
//             status: 200,
//             message: "Ok",
//             data: results[0],
//         });
//     } catch (err) {
//         return res
//             .status(400)
//             .json({ error: true, status: 400, message: err.message.trim() });
//     }
// };

// ctrl.changePasswordUser = async (req, res) => {
//     const { email, oldPassword, newPassword } = req.body;

//     try {
//         // Valida que solo el usuario cambie su password
//         if (email != req.email) {
//             return res.status(400).json({
//                 error: true,
//                 status: 400,
//                 message:
//                     "No tiene privilegios para cambiar el password de otro usuario.",
//             });
//         }

//         // Verifica si existe el usuario (email)
//         const findUser = await Db.userModel.findOne({
//             where: { email: email },
//         });

//         // Si no existe, se rechaza la peticion
//         if (!findUser) {
//             return res.status(400).json({
//                 error: true,
//                 status: 400,
//                 message: `No se pudo realizar el proceso, el usuario no existe.`,
//             });
//         }

//         // Verifica si el password Old existe en la BD
//         const comparacion = await funciones.compararPassword(
//             oldPassword,
//             findUser.password
//         );

//         if (!comparacion) {
//             return res.status(400).json({
//                 error: true,
//                 status: 400,
//                 message: `No se pudo realizar el proceso, la clave [oldPassword] no coincide en la BD.`,
//             });
//         }

//         // Encripta la clave
//         req.body.newPassword = await funciones.encriptarPassword(newPassword);

//         const results = await Db.userModel.update(
//             { password: req.body.newPassword, new_user: false },
//             { where: { id: findUser.id } }
//         );

//         return res.status(200).json({
//             error: false,
//             status: 200,
//             message: "Ok",
//             data: results[0],
//         });
//     } catch (err) {
//         return res
//             .status(400)
//             .json({ error: true, status: 400, message: err.message.trim() });
//     }
// };
