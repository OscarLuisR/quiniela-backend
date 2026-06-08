import { Schema } from "mongoose"; // Importamos mongoose completo
import mongoosePaginate from "mongoose-paginate-v2";

const grupoSchema = new Schema(
    {
        nombre: { type: String, required: true, trim: true },
        idFase: { type: Schema.Types.ObjectId, ref: "Fase", required: true },
        iso_fase: { type: String, required: true, trim: true },
        orden: { type: Number, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// 1. Plugins
grupoSchema.plugin(mongoosePaginate);

// 3. CREAMOS LA CLAVE COMBINADA (Índice compuesto)
// Esto dice: La combinación de nombre + idFase debe ser ÚNICA
grupoSchema.index({ nombre: 1, idFase: 1 }, { unique: true });

// Hook de serialización
grupoSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        delete r.createdAt;
        delete r.updatedAt;
        return r;
    },
});

export default grupoSchema;
