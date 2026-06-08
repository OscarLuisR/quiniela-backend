import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const configuracionSchema = new Schema(
    {
        flagRoles: { type: Boolean, default: false },
        flagUsers: { type: Boolean, default: false },
        flagSedes: { type: Boolean, default: false },
        flagFases: { type: Boolean, default: false },
        flagGrupos: { type: Boolean, default: false },
        flagSelecciones: { type: Boolean, default: false },
        flagClasificacion: { type: Boolean, default: false },
        flagCalendario: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// plugins
configuracionSchema.plugin(mongoosePaginate);

// Hook de serialización
configuracionSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        delete r.createdAt;
        delete r.updatedAt;
        return r;
    },
});

export default configuracionSchema;
