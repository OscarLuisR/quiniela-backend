import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const rolSchema = new Schema(
    {
        nombre: { type: String, required: true, unique: true, trim: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// plugins
rolSchema.plugin(mongoosePaginate);

// Hook de serialización
rolSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        delete r.createdAt;
        delete r.updatedAt;
        return r;
    },
});

export default rolSchema;
