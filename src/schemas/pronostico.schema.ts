import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const pronosticoSchema = new Schema(
    {
        idUsuario: {
            type: Schema.Types.ObjectId,
            ref: "Usuario",
            required: true,
        },
        idFase: { type: Schema.Types.ObjectId, ref: "Fase", required: true },
        idCalendario: {
            type: Schema.Types.ObjectId,
            ref: "Calendario",
        },
        golesEquipoA: { type: Number, default: null },
        golesEquipoB: { type: Number, default: null },
        idGanador: { type: Schema.Types.ObjectId, ref: "Seleccion" }, // null si empate
        puntosLogro: { type: Number, default: 0 }, // 3 puntos
        puntosMarcadorA: { type: Number, default: 0 }, // 1 punto
        puntosMarcadorB: { type: Number, default: 0 }, // 1 punto
        puntosMarcadorExacto: { type: Number, default: 0 }, // 5 puntos
        puntosTotales: { type: Number, default: 0 },
        aceptaPronostico: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// 2. CREAMOS LA CLAVE COMBINADA (Índice compuesto)
// Garantiza que un usuario solo pueda registrar un único pronóstico por cada partido (idCalendario) de una fase
pronosticoSchema.index(
    { idUsuario: 1, idFase: 1, idCalendario: 1 },
    { unique: true },
);

// plugins
pronosticoSchema.plugin(mongoosePaginate);

// Hook de serialización
pronosticoSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        delete r.createdAt;
        delete r.updatedAt;
        return r;
    },
});

export default pronosticoSchema;
