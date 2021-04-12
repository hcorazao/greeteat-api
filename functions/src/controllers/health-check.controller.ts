import * as express from "express";

export default class HealthCheckController {
  public path = '/heart-beat';
  public router = express.Router();
 
  constructor() {
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get(this.path, this.heartBeat);
  }
 
  heartBeat = async (request: express.Request, response: express.Response) => {

    response.json("knock-knock");
  } 
}
