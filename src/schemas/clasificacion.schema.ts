import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const clasificacionSchema = new Schema(
    {
        idFase: { type: Schema.Types.ObjectId, ref: "Fase", required: true },
        idGrupo: { type: Schema.Types.ObjectId, ref: "Grupo", required: true },
        idSeleccion: {
            type: Schema.Types.ObjectId,
            ref: "Seleccion",
            default: null,
        },
        posicion: { type: Number, required: true },
        juegos: { type: Number, default: 0 },
        puntos: { type: Number, default: 0 },
        ganados: { type: Number, default: 0 },
        perdidos: { type: Number, default: 0 },
        empatados: { type: Number, default: 0 },
        golesFavor: { type: Number, default: 0 },
        golesContra: { type: Number, default: 0 },
        diferenciaGoles: { type: Number, default: 0 },
        ranking: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// 2. CREAMOS LA CLAVE COMBINADA (Índice compuesto)
// La combinación de idGrupo + posicion debe ser ÚNICA
clasificacionSchema.index({ idGrupo: 1, posicion: 1 }, { unique: true });

// plugins
clasificacionSchema.plugin(mongoosePaginate);

// Hook de serialización
clasificacionSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        delete r.createdAt;
        delete r.updatedAt;
        return r;
    },
});

export default clasificacionSchema;
