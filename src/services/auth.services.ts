import { UsuarioModel } from "../models/usuario.model.js";
import { RolModel } from "../models/rol.model.js";
import { compararPassword, GeneraToken } from "../utils/funcionesGlobales.js";
import { AppError } from "../utils/appError.js";
import type { IAuth } from "../types/IAuth.js";
import type { IResponseAuth } from "../types/IResponseAuth.js";
import type { IRol } from "../types/IRol.js";
import type { IPayLoad } from "../types/IPayLoad.js";
import type { IOptionsToken } from "../types/IOptionsToken.js";

export async function loginService(data: IAuth): Promise<IResponseAuth> {
    // VERIFICAR SI EL EMAIL NO EXISTE EN LA BD
    const user = await UsuarioModel.findOne({
        email: new RegExp(`^${data.email}$`, "i"),
    }).populate({
        path: "idRol",
        model: RolModel,
        select: "_id nombre",
    });

    if (!user) {
        const message =
            process.env.MODE_ENV === "production"
                ? "Acceso Denegado"
                : "Acceso Denegado. Usuario No Existe";

        throw new AppError(message, 400, "service:loginService");
    }

    // VERIFICAR SI EL PASSWORD INTRODUCIDO COINCIDE CON EL DE LA BD
    const comparacion = await compararPassword(
        data.password,
        user.password,
        "service:loginService",
    );

    if (!comparacion) {
        const message =
            process.env.MODE_ENV === "production"
                ? "Acceso Denegado"
                : "Acceso Denegado. Credenciales Incorrectas";

        throw new AppError(message, 400, "service:loginService");
    }

    // VERIFICAR QUE POSEA UN ROL VALIDO
    const rol =
        user?.idRol && "nombre" in user.idRol ? (user.idRol as IRol) : null;

    if (!rol) {
        const message =
            process.env.MODE_ENV === "production"
                ? "Acceso Denegado"
                : "Acceso Denegado. Rol Invalido";

        throw new AppError(message, 400, "service:loginService");
    }

    // VERIFICAR QUE EL USUARIO ESTE ACTIVO
    if (user.status.trim().toLocaleLowerCase() != "activo") {
        throw new AppError(
            "Acceso Denegado. Usuario Inactivo",
            400,
            "service:loginService",
        );
    }

    // Construye el cuerpo del payLoad
    const payLoad: IPayLoad = {
        _id: user._id,
        email: user.email.trim(),
        nombre: user.nombre.trim(),
        status: user.status.trim(),
        rol: rol.nombre.trim(),
    };

    // Construye las opciones para el AccessToken
    const optionsAccessToken: IOptionsToken = {
        secret: process.env.APP_SECRET_ACCESS_TOKEN!,
        expiresIn: process.env.APP_SESSION_TIMEOUT_ACCESS_TOKEN!,
    };

    // Genero el AccessToken
    const accessToken = await GeneraToken(
        payLoad,
        optionsAccessToken,
        "service:loginService",
    );

    // Construye las opciones para el RefreshToken
    const optionsRefreshToken: IOptionsToken = {
        secret: process.env.APP_SECRET_REFRESH_TOKEN!,
        expiresIn: process.env.APP_SESSION_TIMEOUT_REFRESH_TOKEN!,
    };

    // Genero el RefreshToken
    const refreshToken = await GeneraToken(
        payLoad,
        optionsRefreshToken,
        "service:loginService",
    );

    const respuesta: IResponseAuth = {
        accessToken,
        refreshToken,
        payLoad,
    };

    return respuesta;
}
