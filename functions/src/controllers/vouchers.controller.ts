import * as express from "express";
import CreateVoucherDto from "../models/createVoucher.model";
import { UberManager } from "../managers/uber.manager";
import { CreateVoucherValidator, ICreateVoucherSchema } from "../validators/uber/create.validator";
import { createValidator, ValidatedRequest } from "express-joi-validation";
import { GeResponse } from "../models/response.model";
import CreateRedeemDto from "../models/createRedeemDto.model";
import UberUpdateDto from "../models/uberUpdateDto.model";

export default class VouchersController {
  public path = '/vouchers';
  public router = express.Router();
  private manager: UberManager;
  private createVoucherValidator: CreateVoucherValidator;
 
  constructor() {
    this.manager = new UberManager();
    this.createVoucherValidator = new CreateVoucherValidator();
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    const validator = createValidator();

    this.router.get(`${this.path}/:id`, this.getVoucher); // get

    this.router.post(
      this.path,
      validator.body(this.createVoucherValidator.querySchema),
      this.createVoucher); // create

    this.router.patch(`${this.path}/:id/:mid`, this.updateVoucher); //update
    this.router.post(`${this.path}/:id/cancel`, this.cancelVoucher); //cancel
    this.router.get(`${this.path}/:id/codes`, this.getRedeemCodes); //get codes
    this.router.post(`${this.path}/:id/codes/generate`, this.createRedeemCode); //create codes
    this.router.post(`${this.path}/redeem`, this.useRedeemCode); //use redeem

    this.router.post(`${this.path}/update`, this.update); //use redeem
  }
 
  getVoucher = async (request: express.Request, response: express.Response) => {
    try {
      // valid is Id is Guid
      const voucherId = request.params.id;

      // eslint-disable-next-line no-invalid-this
      const uberResponse = await this.manager.getVoucher(voucherId, request.userid);
      response.status(uberResponse.statusCode).json(uberResponse);
    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.response500(error, "Failed to get Voucher.");
      response.status(geResponse.statusCode).json(geResponse);
    }
  } 

  createVoucher = async (request: ValidatedRequest<ICreateVoucherSchema>, response: express.Response) => {
    try {
      const newVoucher:CreateVoucherDto = request.body;

      // eslint-disable-next-line no-invalid-this
      const uberResponse = await this.manager.createVoucher(newVoucher, request.userid);
      response.status(uberResponse.statusCode).json(uberResponse);
    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.response500(error, "Failed to create Voucher.");
      response.status(geResponse.statusCode).json(geResponse);
    }
  }  

  updateVoucher = async (request: express.Request, response: express.Response) => {
    try {
      // valid is Id is Guid
      const voucherId = request.params.id;
      const meetingId = request.params.mid;

      // eslint-disable-next-line no-invalid-this
      const uberResponse = await this.manager.setVoucherRedeemCodes(voucherId, request.userid, meetingId);
      response.status(uberResponse.statusCode).json(uberResponse);
    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.response500(error, "Failed to update Voucher.");
      response.status(geResponse.statusCode).json(geResponse);
    }
  }

  cancelVoucher = async (request: express.Request, response: express.Response) => {
    response.json("cancelVoucher");
  }
  
  getRedeemCodes = async (request: express.Request, response: express.Response) => {
    try {
      // valid is Id is Guid
      const voucherId = request.params.id;

      // eslint-disable-next-line no-invalid-this
      const uberResponse = await this.manager.getRedeemCodes(voucherId, request.userid);
      response.status(uberResponse.statusCode).json(uberResponse);
    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.response500(error, "Failed to get Redeems codes.");
      response.status(geResponse.statusCode).json(geResponse);
    }
  }

  createRedeemCode = async (request: express.Request, response: express.Response) => {
    try {
      // valid is Id is Guid
      const voucherId = request.params.id;
      const amountOfNewRedeemCodes:CreateRedeemDto = request.body;

      // eslint-disable-next-line no-invalid-this
      const uberResponse = await this.manager.generateRedeemCodes(voucherId, amountOfNewRedeemCodes.amount, request.userid);
      response.status(uberResponse.statusCode).json(uberResponse);
    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.response500(error, "Failed to create Redeem code.");
      response.status(geResponse.statusCode).json(geResponse);
    }
  }

  useRedeemCode = async(request: express.Request, response: express.Response) => {

    response.json("useRedeemCode");
  }

  update = async(request: express.Request, response: express.Response) => {
    const updateRequest = 
      new UberUpdateDto(
        request.body.organization_id,
        request.body.event_type,
        request.body.campaign_organization_id,
        request.body.voucher_program_id,
        request.body.resource_href,
        request.body.usage_voucher_claim_count,
        request.body.usage_trip_count,
        request.body.usage_amount,
        request.body.usage_amount_currency,
        request.body.is_disabled);

    switch (updateRequest.eventType) {
      case "voucher_program_code_claimed":
        // eslint-disable-next-line no-invalid-this
        await this.manager.setVoucherRedeemStatus(updateRequest.voucherId, request.userid);
        response.status(200).json("voucher_program_code_claimed"); return;
        break;

      case "voucher_program_code_redeemed":
        response.status(200).json("voucher_program_code_redeemed"); return;
        break;
    
      case "voucher_program_created":
        // eslint-disable-next-line no-invalid-this
        await this.manager.setVoucherRedeemCodes(updateRequest.voucherId, request.userid);
        break;

      case "voucher_program_completed":
  
        break;

      case "voucher_program_updated":
  
        break;

      case "voucher_program_activated":
  
        break;

      default:
        response.status(500).json(updateRequest); return;
        break;
    }

    response.status(200).json(updateRequest);
  }
}
