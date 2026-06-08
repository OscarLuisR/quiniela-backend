import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const calendarioSchema = new Schema(
    {
        nroPartido: { type: Number, required: true },
        idFase: { type: Schema.Types.ObjectId, ref: "Fase", required: true },
        idGrupo: { type: Schema.Types.ObjectId, ref: "Grupo", required: true },
        idEquipoA: {
            type: Schema.Types.ObjectId,
            ref: "Seleccion",
        },
        idEquipoB: {
            type: Schema.Types.ObjectId,
            ref: "Seleccion",
        },
        idSede: { type: Schema.Types.ObjectId, ref: "Sede", required: true },
        fecha: { type: Date, required: true },
        golesEquipoA: { type: Number, default: null },
        golesEquipoB: { type: Number, default: null },
        statusJuego: { type: Number, default: 0 },
        idGanador: { type: Schema.Types.ObjectId, ref: "Seleccion" },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// 2. CREAMOS LA CLAVE COMBINADA (Índice compuesto)
calendarioSchema.index({ nroPartido: 1, idFase: 1 }, { unique: true });

// plugins
calendarioSchema.plugin(mongoosePaginate);

// Hook de serialización
calendarioSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        delete r.createdAt;
        delete r.updatedAt;
        return r;
    },
});

export default calendarioSchema;
