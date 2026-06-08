import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const usuarioSchema = new Schema(
    {
        nombre: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        status: {
            type: String,
            enum: ["activo", "inactivo"],
            default: "inactivo",
        },
        password: { type: String, required: true },
        idRol: { type: Schema.Types.ObjectId, ref: "Rol", required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// plugins
usuarioSchema.plugin(mongoosePaginate);

// Hook de serialización
usuarioSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        delete r.password;
        delete r.createdAt;
        delete r.updatedAt;
        return r;
    },
});

export default usuarioSchema;
