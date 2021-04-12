import * as express from "express";
import { StripeManager } from "../managers/stripe.manager";
import { UberManager } from "../managers/uber.manager";
import CreateVoucherDto from "../models/createVoucher.model";
import { GeResponse } from "../models/response.model";
import { MeetingsRepository } from "../repository/meetings.repository";
import constants from "../utils/constants";

export default class StripeController {
  public path = '/stripe';
  public router = express.Router();
  public stripe: StripeManager;
  private meetingRepo: MeetingsRepository;
  private manager: UberManager;
 
  constructor() {
    this.intializeRoutes();
    this.manager = new UberManager();
    this.stripe = new StripeManager();
    this.meetingRepo = new MeetingsRepository();
  }
 
  public intializeRoutes() {
    this.router.post(this.path, this.createUser);
    this.router.post(`${this.path}/webhook`, this.webHookHandler);
    this.router.post(`${this.path}/charge`, this.charge);
    this.router.post(`${this.path}/session`, this.createSession);
    this.router.get(`${this.path}/card`, this.getCards);
    this.router.post(`${this.path}/card`, this.addCard);
    this.router.delete(`${this.path}/card/:id`, this.deleteCard);
  }
 
  createUser = async (request: express.Request, response: express.Response) => {
    try {
      // eslint-disable-next-line no-invalid-this
      const stripeResponse = await this.stripe.createUser(request.userid, `Greet Eat user [${request.userid}].`);

      response.status(stripeResponse.statusCode).json(stripeResponse);
    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.response500(error, "Failed to create Stripe user.");
      response.status(geResponse.statusCode).json(geResponse);
    }
  }

  webHookHandler = async (request: express.Request, response: express.Response) => {
    const updateRequest = request.body;

    try {
      const endpointSecret = constants.Stripe.EndpointSecret;
      const signature = request.headers['stripe-signature'] ?? "";
      let validSignature:string = "";

      if (Array.isArray(signature)) {
        validSignature = signature[0];
      } else {
        validSignature = signature;
      }

      // eslint-disable-next-line no-invalid-this
      const event = await this.stripe.constructEvent(request.rawBody, validSignature, endpointSecret);

      if (!event.isSuccessful) {
        response.status(400).send(event.error);
      }

      switch (updateRequest.type) {
        case "charge.failed":
          response.status(200).json({received: true, body: updateRequest, eventType: "charge.failed"}); return;
          break;

        case "charge.succeeded":
          response.status(200).json({received: true, body: updateRequest, eventType: "charge.succeeded"}); return;
          break;
      
        case "payment_intent.succeeded":
          response.status(200).json({received: true, body: updateRequest, eventType: "payment_intent.succeeded"}); return;
          break;

        case "payment_method.attached":
          response.status(200).json({received: true, body: updateRequest, eventType: "payment_method.attached"}); return;
          break;

        case "checkout.session.completed":
          const meetingId = updateRequest.data.object.metadata.meetingId;
          const userId = updateRequest.data.object.metadata.userId;

          // eslint-disable-next-line no-invalid-this
          const repoResponse = await this.meetingRepo.setPrepaidStatus(meetingId);

          if (repoResponse.isSuccessful) {

            // eslint-disable-next-line no-invalid-this
            const meetingResponse = await this.meetingRepo.get(meetingId, userId);
            
            if (meetingResponse.isSuccessful && meetingResponse.data) {
              const endTime = new Date(meetingResponse.data.StartTime);
              endTime.setMinutes(endTime.getMinutes() + meetingResponse.data.Duration);
              
              const newVoucher = 
                new CreateVoucherDto(
                  meetingResponse.data.TopicName, 
                  new Date(meetingResponse.data.StartTime).getTime(),
                  endTime.getTime(),
                  meetingResponse.data.Participants.length,
                  meetingResponse.data.VoucherPrice,
                  meetingResponse.data.Id);

              // eslint-disable-next-line no-invalid-this
              const uberResponse = await this.manager.createVoucher(newVoucher, userId);

              if (uberResponse.isSuccessful) {
                response.status(200).json({
                  received: true,
                  body: updateRequest, 
                  eventType: "checkout.session.completed", 
                  meetingId: meetingId, 
                  userId: userId,
                  repoResponse: repoResponse,
                  meetingResponse: meetingResponse,
                  uberResponse: uberResponse,
                  status: "All went well.",
                });
              } else {
                response.status(200).json({
                  received: true,
                  body: updateRequest, 
                  eventType: "checkout.session.completed", 
                  meetingId: meetingId, 
                  userId: userId,
                  repoResponse: repoResponse,
                  meetingResponse: meetingResponse,
                  uberResponse: uberResponse,
                  status: "Failed to create Voucher for a Meeting.",
                });
              }

              return;
            } else {
              response.status(200).json({
                received: true,
                body: updateRequest, 
                eventType: "checkout.session.completed", 
                meetingId: meetingId,
                userId: userId,
                repoResponse: repoResponse,
                meetingResponse: meetingResponse,
                status: "Failed to get Meeting by Id.",
              });
              return;
            }
          } else {
            response.status(200).json({
              received: true,
              body: updateRequest, 
              eventType: "checkout.session.completed", 
              meetingId: meetingId, 
              userId: userId,
              repoResponse: repoResponse,
              status: "Failed to set prepaidStatus for Meeting.",
            });
            return;
          };

        default:
          response.status(200).json({received: true, body: updateRequest, eventType: "unexpected event type, return 500."}); return;
      }
    } catch (error) {
      response.status(500).json({received: true, body: updateRequest, eventType: "Fake error. Unexpected event type. Return 500.", error: error}); 
    }
  }

  charge = async (request: express.Request, response: express.Response) =>{

    let stripeResponse;

    try {
      const body = request.body;

      // eslint-disable-next-line no-invalid-this
      stripeResponse = await this.stripe.authorizedHold(body.amount, body.id, body.meetingId, body.userId);

      response.status(stripeResponse.statusCode).json(stripeResponse);

    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.data = stripeResponse;
      geResponse.response500(error, "Failed to charge.");
      response.status(geResponse.statusCode).json(geResponse);
    }
  }
  
  createSession = async (request: express.Request, response: express.Response) =>{

    let stripeResponse;

    try {
      const body = request.body;

      // eslint-disable-next-line no-invalid-this
      stripeResponse = await this.stripe.createSession(body.amount, body.meetingId, request.userid);

      response.status(stripeResponse.statusCode).json(stripeResponse);

    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.data = stripeResponse;
      geResponse.response500(error, "Failed to create checkout session.");
      response.status(geResponse.statusCode).json(geResponse.data.id);
    }
  }

  addCard = async (request: express.Request, response: express.Response) =>{

    let stripeResponse;

    try {
      const body = request.body;

      // eslint-disable-next-line no-invalid-this
      stripeResponse = await this.stripe.addCard(body.token, request.userid);

      response.status(stripeResponse.statusCode).json(stripeResponse);

    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.data = stripeResponse;
      geResponse.response500(error, "Failed to create credit card.");
      response.status(geResponse.statusCode).json(geResponse.data.id);
    }
  }

  deleteCard = async (request: express.Request, response: express.Response) =>{

    let stripeResponse;

    try {
      const voucherId = request.params.id;

      // eslint-disable-next-line no-invalid-this
      stripeResponse = await this.stripe.deleteCard(voucherId, request.userid);

      response.status(stripeResponse.statusCode).json(stripeResponse);

    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.data = stripeResponse;
      geResponse.response500(error, "Failed to delete credit card.");
      response.status(geResponse.statusCode).json(geResponse.data.id);
    }
  }

  getCards = async (request: express.Request, response: express.Response) =>{

    let stripeResponse;

    try {
      // eslint-disable-next-line no-invalid-this
      stripeResponse = await this.stripe.listCards(request.userid);

      response.status(stripeResponse.statusCode).json(stripeResponse);

    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.data = stripeResponse;
      geResponse.response500(error, "Failed to get credit cards list.");
      response.status(geResponse.statusCode).json(geResponse.data.id);
    }
  }
}
