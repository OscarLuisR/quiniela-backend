import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const faseSchema = new Schema(
    {
        nombre: { type: String, required: true, unique: true, trim: true },
        iso_fase: { type: String, required: true, unique: true, trim: true },
        orden: { type: Number, required: true },
        faseAbierta: { type: Boolean, required: true, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// plugins
faseSchema.plugin(mongoosePaginate);

// Hook de serialización
faseSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        delete r.createdAt;
        delete r.updatedAt;
        return r;
    },
});

export default faseSchema;
