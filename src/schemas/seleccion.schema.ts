import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const seleccionSchema = new Schema(
    {
        pais: { type: String, required: true, unique: true, trim: true },
        codigo_iso: { type: String, required: true, unique: true, trim: true },
        bandera_url: { type: String, default: "" },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// plugins
seleccionSchema.plugin(mongoosePaginate);

// Hook de serialización
seleccionSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        delete r.createdAt;
        delete r.updatedAt;
        return r;
    },
});

export default seleccionSchema;
