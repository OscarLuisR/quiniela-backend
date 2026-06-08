import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const sedeSchema = new Schema(
    {
        codigo: { type: Number, required: true, unique: true, default: 0 },
        pais: { type: String, required: true, trim: true },
        ciudad: { type: String, required: true, trim: true },
        estadium: { type: String, required: true, trim: true },
        capacidad: { type: Number, default: 0 },
        estadium_url: { type: String, default: "" },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// plugins
sedeSchema.plugin(mongoosePaginate);

// CREAMOS LA CLAVE COMBINADA (Índice compuesto)
sedeSchema.index({ pais: 1, ciudad: 1, estadium: 1 }, { unique: true });

// Hook de serialización
sedeSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        delete r.createdAt;
        delete r.updatedAt;
        return r;
    },
});

export default sedeSchema;
