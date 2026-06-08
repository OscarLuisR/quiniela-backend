import { Router } from "express";
import routerRaiz from "../routes/raiz.routes.js";
import routerUser from "../routes/user.routes.js";
import routerAuth from "../routes/auth.routes.js";
import routerSeleccion from "./seleccion.routes.js";
import routerFase from "./fase.routes.js";
import routerGrupos from "./grupo.routes.js";
import routerClasificacion from "../routes/clasificacion.routes.js";
import routerCalendario from "../routes/calendario.routes.js";
import routerPronostico from "../routes/pronostico.routes.js";
import routerConfiguracion from "../routes/configuracion.routes.js";
import routerRanking from "../routes/ranking.routes.js";

const routes = Router();

routes.use("/", routerRaiz);
routes.use("/user", routerUser);
routes.use("/auth", routerAuth);
// routes.use("/sede", routerSeleccion);
routes.use("/fase", routerFase);
routes.use("/grupo", routerGrupos);
routes.use("/seleccion", routerSeleccion);
routes.use("/clasificacion", routerClasificacion);
routes.use("/calendario", routerCalendario);
routes.use("/pronostico", routerPronostico);
routes.use("/configuracion", routerConfiguracion);
routes.use("/ranking", routerRanking);
// routes.use("/rol", routerRol);

export default routes;
