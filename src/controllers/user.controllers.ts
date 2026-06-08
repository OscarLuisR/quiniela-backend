import type { NextFunction, Request, Response } from "express";
import type { IAuthenticatedRequest } from "../types/IAuthenticatedRequest.js";
import * as serv from "../services/user.services.js";

export async function getUsersController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const authReq = req as IAuthenticatedRequest;

    const adminId: string = authReq._id.toString(); // El ID viene del token decodificado

    const { page, limit, statusUser, search } = res.locals; // Extraemos todo de locals

    const results = await serv.getUsersService(
        adminId,
        page,
        limit,
        statusUser,
        search,
    );

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: results.pagination,
    });
}

export async function createUserController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const result = await serv.createUserService(req.body);

    res.status(201).json({
        error: false,
        status: 201,
        message: "Ok",
        data: result,
        pagination: null,
    });
}

export async function updateUserController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    // 1. Desestructuras con 'as any' para evitar el error de string[]
    const { _id } = req.params as any;
    const { status } = req.body;

    await serv.updateUserService(_id, status);

    res.status(200).json({
        error: false,
        status: 200,
        message: "Usuario modificado",
        data: null,
        pagination: null,
    });
}

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
