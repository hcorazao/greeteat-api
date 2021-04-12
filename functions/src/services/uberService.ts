import * as superagent from "superagent";
import FirebaseAdminWrapper from '../utils/firebase-admin-wrapper';
import constants from "../utils/constants";
import { GeResponse } from "../models/response.model";
import CreateVoucherDto from "../models/createVoucher.model";
import VoucherDetailsDto from "../models/voucherDetailsDto.model";

interface IUberAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

class UberService {
    private static instance: UberService; 
    // private authObj: admin.auth. = admin.auth();

    static getInstance(): UberService {

        if (!UberService.instance) {

          FirebaseAdminWrapper.App;
          UberService.instance = new UberService();
        }

        return UberService.instance;
  }

  async getAuthToken(): Promise<string> { 
    const requestBody = {
      'client_id': constants.Uber.ClientId,
      'client_secret': constants.Uber.ClientSecret,
      'grant_type': constants.Uber.GrantType,
      'scope': constants.Uber.Scope,
    };

    const response =
      await superagent
        .post("https://login.uber.com/oauth/v2/token")          
        .type('form')
        .send(requestBody);

    const responseBody = response?.body as IUberAuthResponse;

    // console.log("getAuthToken:responseBody", responseBody);
    
    const token = responseBody.access_token;

    return token;
  }

  async getVoucher(voucherId:string): Promise<GeResponse<VoucherDetailsDto | object>> {
    const response = new GeResponse<any>();

    try {
      const token: string =  await this.getAuthToken(); 
      const organization_id = constants.Uber.OrganizationId;

      const url = `https://api.uber.com/v1/organizations/${organization_id}/voucher-programs/${voucherId}`;

      const uberResponse =
        await superagent
          .get(url)
          .set('Authorization', 'Bearer ' + token)   
          .type('json')
          .retry(5);

      response.message = "Get Uber Response";
      response.statusCode = uberResponse.status;
      response.data = uberResponse.status === 200 ? this.mapToVoucher(uberResponse.body) : uberResponse.body; 
      response.isSuccessful = 
        !(uberResponse.forbidden && 
        uberResponse.notFound &&
        uberResponse.serverError);

    } catch (error) {
      response.response500(error, "Error on getting Uber Voucher.");
    }

    return response;
  }

  async createVoucher(voucher:CreateVoucherDto): Promise<GeResponse<any>> {
    const response = new GeResponse<any>();

    try {
      const token: string =  await this.getAuthToken();

      const body = this.getCreateVoucherModel(voucher);
  
      const organization_id = constants.Uber.OrganizationId;
  
      const url = `https://api.uber.com/v1/organizations/${organization_id}/voucher-programs`;

      const uberResponse =
        await superagent
          .post(url)
          .set('Authorization', 'Bearer ' + token)   
          .type('json')
          .send(body);

      response.message = "Create Uber Response";
      response.statusCode = uberResponse.status;
      response.data = uberResponse.body;
      response.isSuccessful = 
        !(uberResponse.forbidden && 
        uberResponse.notFound &&
        uberResponse.serverError);

    } catch (error) {
      response.response500(error, "Error on creating Uber Voucher.");
    }

    return response;
  }

  async getRedeemCodes(voucherId:string): Promise<GeResponse<any>> {

    const response = new GeResponse<any>();

    try {
      const token: string =  await this.getAuthToken();
      
      const organization_id = constants.Uber.OrganizationId;

      const url = `https://api.uber.com/v1/organizations/${organization_id}/voucher-programs/${voucherId}/codes`;

      const uberResponse =
        await superagent
          .get(url)
          .set('Authorization', 'Bearer ' + token)   
          .type('json')
          .retry(50);

      response.message = "Get Uber Redeem Codes Response";
      response.statusCode = uberResponse.status;
      response.data = uberResponse.body;
      response.isSuccessful = 
        !(uberResponse.forbidden && 
        uberResponse.notFound &&
        uberResponse.serverError);

    } catch (error) {
      response.response500(error, "Error on getting Uber Redeem Codes.");
    }

    return response;
  }

  async generateRedeemCodes(voucherId:string, amount:number): Promise<GeResponse<any>> {

    const response = new GeResponse<any>();

    try {
      const token: string =  await this.getAuthToken();
      
      const organization_id = constants.Uber.OrganizationId;
      
      const body = {"number_of_codes": amount};

      const url = `https://api.uber.com/v1/organizations/${organization_id}/voucher-programs/${voucherId}/codes/generate`;

      const uberResponse =
        await superagent
          .post(url)
          .set('Authorization', 'Bearer ' + token)   
          .type('json')
          .send(body);

      response.message = "Get Uber Redeem Codes Response";
      response.statusCode = uberResponse.status;
      response.data = uberResponse.body;
      response.isSuccessful = 
        !(uberResponse.forbidden && 
        uberResponse.notFound &&
        uberResponse.serverError);

    } catch (error) {
      response.response500(error, "Error on generating Uber Redeem Codes.");
    }

    return response;
  }

  async cancelVoucher(voucherId:string): Promise<GeResponse<any>> {

    const response = new GeResponse<any>();

    try {
      const token: string =  await this.getAuthToken();
      
      const organization_id = constants.Uber.OrganizationId;
      
      const body = {};

      const url = `https://api.uber.com/v1/organizations/${organization_id}/voucher-programs/${voucherId}/cancel`;

      const uberResponse =
        await superagent
          .post(url)
          .set('Authorization', 'Bearer ' + token)   
          .type('json')
          .send(body);

      response.message = "Cancel Uber Voucher Response";
      response.statusCode = uberResponse.status;
      response.data = uberResponse.body;
      response.isSuccessful = 
        !(uberResponse.forbidden && 
        uberResponse.notFound &&
        uberResponse.serverError);

    } catch (error) {
      response.response500(error, "Error on canceling Uber Voucher.");
    }

    return response;
  }

  private getCreateVoucherModel(newVoucher:CreateVoucherDto): any {
    // const description =  `Voucher for meeting:[${newVoucher.meetingId}], partisipants amount:[${newVoucher.participantAmount}], voucherCost:[${newVoucher.voucherCost}], startTime:[${new Date(newVoucher.startTime).toISOString()}], endTime:[${new Date(newVoucher.endTime).toISOString()}].`;

    const description = JSON.stringify(newVoucher);

    const requestBody = {
      "name": newVoucher.name,
      "description": description,
      "currency_code": "USD",
      "starts_at": newVoucher.startTime, //provide
      "ends_at": newVoucher.endTime, //provide
      // "max_trips_per_client": 1, //value_per_period_max_trips
      // "max_value_per_trip": 50, //value_per_trip_max_amount //voucher value in total?
      "code_scheme": "MULTI_CODE_SINGLE_REDEEM",
      "number_of_codes": newVoucher.participantAmount, //amount of partisipants
      "redemptions_per_code": 1,
      "value_per_period_max_trips": 1,
      "value_per_period_max_amount": newVoucher.voucherCost, //voucher value
      "value_recurrence_period": "SINGLE", //use once
      "value_per_trip_deductible": 0, // trip fare that will be charged to the rider before being charged to the voucher issuer
      "value_per_trip_max_amount":newVoucher.voucherCost, //voucher value
      "voucher_type": "EATS",
      "expense_memo": `{meeting_id:${newVoucher.meetingId}}`,
    };

    return requestBody;
  }

  private mapToVoucher(body:any):VoucherDetailsDto {
    return new VoucherDetailsDto(
      body.is_disabled,
      body.name,
      body.description,
      body.expense_memo,
      body.starts_at,
      body.ends_at,
      body.created_at,
      body.value_per_trip_max_amount,
    );
  }
}

export default UberService;
