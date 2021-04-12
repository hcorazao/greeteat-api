import * as express from 'express';
import { GeResponse } from "../models/response.model";
import StripeController from "./stripe.controller";

interface IDictionary {
    [key: string]: any;
}

const mockGeResponse500 = new GeResponse<boolean>();
    mockGeResponse500.statusCode = 500;
    mockGeResponse500.error = { error: "test-error" };

const mockGeResponse201 = new GeResponse<string>();            
mockGeResponse201.statusCode = 201;
mockGeResponse201.data = "some-fake-id";

const mockGeResponse200 = new GeResponse<string>();            
mockGeResponse201.statusCode = 200;
mockGeResponse201.data = "some-fake-id";

const mockCreate = jest.fn().mockReturnValue(mockGeResponse201);
const mockAuthorizedHold = jest.fn().mockReturnValue(mockGeResponse200);

jest.mock("../managers/stripe.manager", () => {
    return {
        StripeManager: jest.fn(() => {
            return {
                createUser: mockCreate,
                authorizedHold: mockAuthorizedHold,
            };
        }),
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

    return request;
}

describe("Stripe controller", () => {
    test('stripe controller - init successfully', async () => {
        const controller = new StripeController();

        expect(controller).not.toBeNull();
    });

    test('stripe controller - createUser response 201', async () => {
        const controller = new StripeController();

        expect(controller).not.toBeNull();

        const request = mockRequest();

        const response = mockResponse();
        
        await controller.createUser(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse201.statusCode);

        expect(response.json).toHaveBeenCalledTimes(1);
    });

    test('stripe controller - createUser response 500', async () => {
        const controller = new StripeController();

        expect(controller).not.toBeNull();

        const request = mockRequest();

        const response = mockResponse();

        mockCreate.mockReturnValue(mockGeResponse500);
        
        await controller.createUser(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse500.statusCode);

        expect(response.json).toHaveBeenCalledTimes(1);
    });

    test('stripe controller - charge response 200', async () => {
        const controller = new StripeController();

        expect(controller).not.toBeNull();

        const request = mockRequest();
        request.body =  {
            amount: 10000,
            id: "fake-id",
            meetingId: "meeting-id",
            userId: "user-id",
        };

        const response = mockResponse();

        await controller.charge(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse200.statusCode);

        expect(response.json).toHaveBeenCalledTimes(1);
    });

    test('stripe controller - charge response 500', async () => {
        const controller = new StripeController();

        expect(controller).not.toBeNull();

        const request = mockRequest();
        request.body =  {
            amount: 10000,
            id: "fake-id",
            meetingId: "meeting-id",
            userId: "user-id",
        };

        const response = mockResponse();

        mockAuthorizedHold.mockReturnValue(mockGeResponse500);
        
        await controller.charge(request, response);

        expect(response.status).toHaveBeenCalledWith(mockGeResponse500.statusCode);

        expect(response.json).toHaveBeenCalledTimes(1);
    });

});