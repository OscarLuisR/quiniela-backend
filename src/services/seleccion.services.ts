import { SeleccionModel } from "../models/seleccion.model.js";
import type { ISeleccion } from "../types/ISeleccion.js";

export async function getSeleccionesService(): Promise<{ docs: ISeleccion[] }> {
    const results = await SeleccionModel.find({}).sort({ pais: 1 });

    return {
        docs: results,
    };
}
