import { model, type PaginateModel } from "mongoose";
import rankingSchema from "../schemas/ranking.schema.js";
import type { IRanking } from "../types/IRanking.js";

export const RankingModel = model<IRanking, PaginateModel<IRanking>>(
    "Ranking",
    rankingSchema,
);
