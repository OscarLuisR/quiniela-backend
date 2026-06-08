import type { IPayLoad } from "./IPayLoad";

export interface IResponseAuth {
    accessToken: string;
    refreshToken: string;
    payLoad: IPayLoad;
}
