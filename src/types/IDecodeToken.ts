import type { IPayLoad } from "./IPayLoad";

export interface IDecodeToken {
    error?: boolean;
    status?: number;
    message?: string;
    payLoad?: IPayLoad;
}
