import{ Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";
import { GeResponse } from "../models/response.model";

export default class Authentication {

  getAuthenticationMiddleware() {
    const geResponse = new GeResponse<undefined>();

    const authenticate = async (req: Request, res: Response, next: NextFunction) => {

      if (req.originalUrl === "/stripe/webhook") {
        next();
        return;
      }

      if (!req?.headers?.authorization || !req?.headers?.authorization?.startsWith('Bearer ')) {
        geResponse.response401(`Missing JWT token from the 'Authorization' header.`);
        res.status(geResponse.statusCode).send(geResponse);
        return;
      }

      try {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);       
        req.userid = decodedIdToken.uid;
        next();
      } catch(e) {
        geResponse.response401(`Invalid JWT token.`);
        geResponse.error = e;
        res.status(geResponse.statusCode).send(geResponse);
      }
    };

    return authenticate;
  }    
}
