import * as functions from 'firebase-functions';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as helmet from "helmet";
import * as cors from "cors";
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import * as loggingWinston from "@google-cloud/logging-winston";

import AuthenticationMiddleware from './middleware/authentication.middleware';
import UtilityMiddleware from './middleware/utility.middleware';
import constants from './utils/constants';
 
class App {
  public app: express.Application;
  public port: number;
  private logger: winston.Logger;
  private corsOptions: cors.CorsOptions = constants.GreetEat.CorsOptions;
  private loggerOptions: expressWinston.LoggerOptions = constants.GreetEat.LoggingOptions;

  constructor(controllers: any, port: number) {
    this.app = express();
    this.port = port;

    const middlewareLoggerOptions: winston.LoggerOptions = 
    {
      transports: [
        new winston.transports.Console(),
        new loggingWinston.LoggingWinston({}),
      ],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
      ),
    }

    this.logger = winston.createLogger(middlewareLoggerOptions);
 
    this.initializeMiddlewares();
    this.initializeControllers(controllers);

    this.app.use(expressWinston.errorLogger(this.loggerOptions));
  }
 
  private initializeMiddlewares() {
    const authMidleware = new AuthenticationMiddleware();
    const utilityMiddleware = new UtilityMiddleware();
    const corsSettings = cors(this.corsOptions);

    this.app.use(expressWinston.logger(this.loggerOptions));
    this.app.use(helmet());
    this.app.use(corsSettings);
    this.app.use(utilityMiddleware.setLogging(this.logger));
    this.app.use(authMidleware.getAuthenticationMiddleware());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json({
      verify: (req, res, buf) => {
        const url = req.url;

        if (url && url.startsWith("/api/stripe/webhook")) {
          req.rawBody = buf.toString();
        }
      },
    }));
    this.app.use(utilityMiddleware.setRequestTimeout());
  }
 
  private initializeControllers(controllers: any) {
    controllers.forEach((controller: any) => {
      this.app.use('/', controller.router);
    });

    const corsSettings = cors(this.corsOptions);

    this.app.options('*', corsSettings);
  }
 
  public listen():void {
    this.app.listen(this.port, () => {
      this.logger.log({level: "info", message: `App listening on the port ${this.port}`});
    });
  }

  public function():functions.HttpsFunction {
    return functions.https.onRequest(this.app);
  }
}
 
export default App;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userid: string;
      logger: winston.Logger;
      rawBody: any;
    }
  }
}

declare module 'http' {
  interface IncomingMessage {
      rawBody: any;
  }
}