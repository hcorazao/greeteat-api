import * as functions from 'firebase-functions';
import * as express from 'express';
import * as loggingWinston from "@google-cloud/logging-winston";

const corsOptions = {
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'X-Access-Token',
      'Authorization',
    ],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: "*",
    preflightContinue: false,
  };

const loggerOptions = 
{
  transports: [
    // new winston.transports.Console(),
    new loggingWinston.LoggingWinston({}),
  ],
  // format: winston.format.combine(
  //   winston.format.colorize(),
  //   winston.format.json()
  // ),
  metaField: undefined, //this causes the metadata to be stored at the root of the log entry
  responseField: undefined, // this prevents the response from being included in the metadata (including body and status code)
  requestWhitelist: ['body', 'query'],  //these are not included in the standard StackDriver httpRequest
  responseWhitelist: ['body'], // this populates the `res.body` so we can get the response size (not required)
  dynamicMeta:  (req: express.Request, res: any) => {
    const httpRequest = { 
      requestMethod: "", 
      requestUrl: "",
      protocol: "",
      remoteIp: "",
      requestSize: 0,
      userAgent: "",
      referrer: "",
      status: 0,
      latency: {},
      responseSize: 0,

    };
    const meta = { 
      httpRequest,
    };

    if (req) {
      meta.httpRequest = httpRequest;
      httpRequest.requestMethod = req.method;
      httpRequest.requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      httpRequest.protocol = `HTTP/${req.httpVersion}`;
      // httpRequest.remoteIp = req.ip // this includes both ipv6 and ipv4 addresses separated by ':'
      httpRequest.remoteIp = req.ip.indexOf(':') >= 0 ? req.ip.substring(req.ip.lastIndexOf(':') + 1) : req.ip;   // just ipv4
      httpRequest.requestSize = req.socket.bytesRead;
      httpRequest.userAgent = req.get('User-Agent') || "";
      httpRequest.referrer = req.get('Referrer') || "";
    }
  
    if (res) {
      meta.httpRequest = httpRequest;
      httpRequest.status = res.statusCode;
      httpRequest.latency = {
        seconds: Math.floor(res.responseTime / 1000),
        nanos: ( res.responseTime % 1000 ) * 1000000,
      };

      if (res.body) {
        if (typeof res.body === 'object') {
          httpRequest.responseSize = JSON.stringify(res.body).length;
        } else if (typeof res.body === 'string') {
          httpRequest.responseSize = res.body.length;
        }
      }
    }

    return meta;
  },

  level: function (req:express.Request<any>, res: express.Response<any>) {
    let level = "";

    if (res.statusCode >= 100) { level = "info"; }
    if (res.statusCode >= 400) { level = "warn"; }
    if (res.statusCode >= 500) { level = "error"; }
    // Ops is worried about hacking attempts so make Unauthorized and Forbidden critical
    if (res.statusCode === 401 || res.statusCode === 403) { level = "critical"; }
    // No one should be using the old path, so always warn for those
    // if (req.path === "/v1" && level === "info") { level = "warn"; }

    return level;
  },
};

export default {
    "Uber": {
        "ClientId": functions.config().uber?.client_id,
        "ClientSecret": functions.config().uber?.client_secret,
        "GrantType": functions.config().uber?.grant_type,
        "Scope": functions.config().uber?.scope,
        "OrganizationId": functions.config().uber?.organization_id,
    },
    "IsLocalBuild": functions.config().ge?.local_build,
    "Stripe": {
        "ApiKey": functions.config().stripe?.api_key,
        "EndpointSecret": functions.config().stripe?.endpoint_secret,
    },
    "GreetEat": {
        "LoggingOptions" : loggerOptions,
        "CorsOptions": corsOptions,
    },
};