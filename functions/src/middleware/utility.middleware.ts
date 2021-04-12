import{ Request, Response, NextFunction } from "express";
import * as winston from 'winston';

export default class UtilityMiddleware {

  setRequestTimeout() {
    const middleware = async (req: Request, res: Response, next: NextFunction) => {
      req.setTimeout(30000, () => {
        res.status(408).send("Request was aborted. Timeout is 30sec.");
      });
      
      next();
    };

    return middleware;
  }
  
  setLogging(logger:winston.Logger) {
    const middleware = async (req: Request, res: Response, next: NextFunction) => {
      req.logger = logger;

      next();
    };

    return middleware;
  }   
}