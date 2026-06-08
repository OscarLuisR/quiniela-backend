import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const rankingSchema = new Schema(
    {
        idUsuario: {
            type: Schema.Types.ObjectId,
            ref: "Usuario",
            required: true,
        },
        puntosTotales: { type: Number, required: true, default: 0 },
        ranking: { type: Number, required: true, default: 0 },
        cantidadPartidos: { type: Number, required: true, default: 0 },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// plugins
rankingSchema.plugin(mongoosePaginate);

// Hook de serialización
rankingSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        delete r.createdAt;
        delete r.updatedAt;
        return r;
    },
});

export default rankingSchema;
