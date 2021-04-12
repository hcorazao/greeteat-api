import * as express from 'express';
import { GeResponse } from "../models/response.model";
import VouchersController from "./vouchers.controller";
//import test from "firebase-functions-test";

interface IDictionary {
    [key: string]: any;
}

const mockGeResponse500 = new GeResponse<boolean>();
    mockGeResponse500.statusCode = 500;
    mockGeResponse500.error = { error: "test-error" };
    
const mockGeResponse201 = new GeResponse<string>();
    mockGeResponse201.statusCode = 201;
    mockGeResponse201.data = "some-fake-id";
    
const mockGeResponse200 = new GeResponse<any>();
    mockGeResponse200.statusCode = 200;
    mockGeResponse200.data = {data:"some-data"};

const mockUberManagerGet = jest.fn().mockReturnValue(mockGeResponse200);
const mockUberManagerPost = jest.fn().mockReturnValue(mockGeResponse201);
const mockUberManagerGetRedeemCodes = jest.fn().mockReturnValue(mockGeResponse200);
const mockUberManagerGenerateRedeemCodes = jest.fn().mockReturnValue(mockGeResponse200);
const mockUberManagerSetVoucherRedeemStatus = jest.fn().mockReturnValue(mockGeResponse200);

jest.mock('../managers/uber.manager', () => {
    return {
        UberManager: jest.fn(() => {
            return {
                getVoucher: mockUberManagerGet,
                createVoucher: mockUberManagerPost,
                getRedeemCodes: mockUberManagerGetRedeemCodes,
                generateRedeemCodes: mockUberManagerGenerateRedeemCodes,
                setVoucherRedeemStatus: mockUberManagerSetVoucherRedeemStatus,
            };
        }),
    };
});

jest.mock('firebase-functions', () => {
    return {
        config: jest.fn(),
    };
});

const mockResponse = () => {
    const res = {} as express.Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockRequest = () => {
    const request = {
        body: {
          id:"fake-id",
          topicName: "Hello",
          startTime: new Date(Date.now()),
          endTime: new Date(Date.now()),
          participants: [
              "test@test.com",
          ],
          voucherPrice: 9,
          isSecured: true,
          passcode: "passcode-123",
          description: "some-decription",  
        },
      } as express.Request;

    request.get = jest.fn((x:any) => {
        return ["Host:some-host","Host:some-host"] as any;
    });

    
    request.params = jest.fn() as jest.Mocked<IDictionary>;
    request.params.id = "fake-id";

    // paramsList:IDictionary = {
    //     "param1": "hello",
    //     "param2": "hello",
    // };

    // request.params = jest.fn(() => {
    //     return {   
    //         {"param1": "hello",},
    //         {"param2": "hello",}
    //     };
    // });

    return request;
};

describe('Voucher controllers', () => {
    beforeEach(() => {
        mockUberManagerGet.mockClear();
        mockUberManagerPost.mockClear();
    });

    test('voucher controller - init successfully', async () => {

        const controller = new VouchersController();

        expect(controller).not.toBeNull();
    });

    test('voucher controllers - get returns Created(200)', async () => {
        const controller = new VouchersController();

        expect(controller).not.toBeNull();

        const request = mockRequest();

        const response = mockResponse();
        
        await controller.getVoucher(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse200.statusCode);

        expect(response.json).toHaveBeenCalledTimes(1);

        // await testCreateEndpoint(repoResponse, 201);
    });

    test('meeting controllers - get returns Server error(500)', async () => {
        const controller = new VouchersController();

        expect(controller).not.toBeNull();

        const request = mockRequest();

        const response = mockResponse();

        mockUberManagerGet.mockReturnValue(mockGeResponse500);
        
        await controller.getVoucher(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse500.statusCode);

        expect(response.json).toHaveBeenCalledTimes(1);
    });

    test('meeting controllers - create returns No Content(201)', async () => {
        const controller = new VouchersController();

        expect(controller).not.toBeNull();

        const request = mockRequest();

        const response = mockResponse();
        
        await controller.createVoucher(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse201.statusCode);

        expect(response.json).toHaveBeenCalledTimes(1);
    });

    test('meeting controllers - create returns Server error(500)', async () => {
        const controller = new VouchersController();

        expect(controller).not.toBeNull();

        const request = mockRequest();

        const response = mockResponse();

        mockUberManagerPost.mockReturnValue(mockGeResponse500);
        
        await controller.createVoucher(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse500.statusCode);

        expect(response.json).toHaveBeenCalledTimes(1);
    });

    test('meeting controllers - getRedeemCodes returns OK (200)', async () => {
        const controller = new VouchersController();

        expect(controller).not.toBeNull();

        const request = mockRequest();

        const response = mockResponse();
        
        await controller.getRedeemCodes(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse200.statusCode);

        expect(response.json).toHaveBeenCalledTimes(1);
    });

    test('meeting controllers - getRedeemCodes returns Server error(500)', async () => {
        const controller = new VouchersController();

        expect(controller).not.toBeNull();

        const request = mockRequest();

        const response = mockResponse();

        mockUberManagerGetRedeemCodes.mockReturnValue(mockGeResponse500);
        
        await controller.getRedeemCodes(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse500.statusCode);

        expect(response.json).toHaveBeenCalledTimes(1);
    });

    
    test('meeting controllers - createRedeemCode returns OK (200)', async () => {
        const controller = new VouchersController();

        expect(controller).not.toBeNull();

        const request = mockRequest();

        const response = mockResponse();
        
        await controller.createRedeemCode(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse200.statusCode);

        expect(response.json).toHaveBeenCalledTimes(1);
    });

    test('meeting controllers - createRedeemCode returns Server error(500)', async () => {
        const controller = new VouchersController();

        expect(controller).not.toBeNull();

        const request = mockRequest();

        const response = mockResponse();

        mockUberManagerGenerateRedeemCodes.mockReturnValue(mockGeResponse500);
        
        await controller.createRedeemCode(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse500.statusCode);

        expect(response.json).toHaveBeenCalledTimes(1);
    });

    test('meeting controllers - webHook update returns 200 voucher_program_code_claimed', async () => {
        const controller = new VouchersController();

        expect(controller).not.toBeNull();

        const request = mockRequest();

        request.body = {
            "organization_id": "<campaign manager organization uuid>",
            "event_type": "voucher_program_code_claimed",
            "campaign_organization_id": "<campaign owner organization uuid>",
            "voucher_program_id": "<campaign uuid>",
            "usage_voucher_claim_count": "1",
            "usage_amount": "100.0",
            "usage_amount_currency": "USD",
            "resource_href": "https://api.uber.com/v1/organizations/<organization_id>/voucher-programs/<voucher_program_id>",
            "webhook_meta": {
               "client_id": "<client_id>",
               "webhook_config_id": "voucher_program_code_claimed",
               "webhook_msg_timestamp": 1613595672,
               "webhook_msg_uuid": "<unique msg uuid>",
            },
        };

        const response = mockResponse();

        mockUberManagerGenerateRedeemCodes.mockReturnValue(mockGeResponse200);
        
        await controller.update(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse200.statusCode);

        expect(response.json).toHaveBeenCalledWith("voucher_program_code_claimed");

        expect(response.json).toHaveBeenCalledTimes(1);
    });

    test('meeting controllers - webHook update returns 200 on voucher_program_code_redeemed', async () => {
        const controller = new VouchersController();

        expect(controller).not.toBeNull();

        const request = mockRequest();

        request.body = {
            "organization_id": "<campaign manager organization uuid>",
            "event_type": "voucher_program_code_redeemed",
            "campaign_organization_id": "<campaign owner organization uuid>",
            "voucher_program_id": "<campaign uuid>",
            "usage_trip_count": "2",
            "usage_amount": "100.0",
            "usage_amount_currency": "USD",
            "resource_href":  "https://api.uber.com/v1/organizations/<organization_id>/voucher-programs/<voucher_program_id>",
             "webhook_meta": {
                "client_id": "<client_id>",
                "webhook_config_id": "voucher_program_code_redeemed",
                "webhook_msg_timestamp": 1613595672,
                "webhook_msg_uuid": "<unique msg uuid>",
             },
         };         

        const response = mockResponse();

        mockUberManagerGenerateRedeemCodes.mockReturnValue(mockGeResponse200);
        
        await controller.update(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse200.statusCode);

        expect(response.json).toHaveBeenCalledWith("voucher_program_code_redeemed");

        expect(response.json).toHaveBeenCalledTimes(1);
    });

    test('meeting controllers - webHook update returns 500 on bad request', async () => {
        const controller = new VouchersController();

        expect(controller).not.toBeNull();

        const request = mockRequest();

        request.body = { };         

        const response = mockResponse();

        mockUberManagerGenerateRedeemCodes.mockReturnValue(mockGeResponse500);
        
        await controller.update(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse500.statusCode);

        expect(response.json).toHaveBeenCalledTimes(1);
    });
});