import { NextFunction, Request, Response } from 'express';
import Authentication from "./authentication.middleware";

jest.mock('firebase-admin', () => ({
    auth: jest.fn(() => ({ 
        verifyIdToken: jest.fn(() => {throw new Error("Test Exception");}),
    })), 
}));

describe('Authentication middleware', () => {

    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    const nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            headers: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn(),
        };
    });

    test('without headers', async () => {
        
        const expectedResponse = {
            "data": null,
            "error": null,
            "isSuccessful": false,
            "message": "Missing JWT token from the 'Authorization' header.",
            "statusCode": 401,
        };

        const authMiddleware = new Authentication();
        const authFunc = authMiddleware.getAuthenticationMiddleware();

        // if(mockResponse!.status(400)) mockResponse.status(400);

        await authFunc(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.send).toBeCalledWith(expectedResponse);
    });

    test('without "authorization" header', async () => {
        const expectedResponse = {
            "data": null,
            "error": null,
            "isSuccessful": false,
            "message": "Missing JWT token from the 'Authorization' header.",
            "statusCode": 401,
        };
        
        mockRequest = {
            headers: {
            },
        }
        const authMiddleware = new Authentication();
        const authFunc = authMiddleware.getAuthenticationMiddleware();

        await authFunc(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.send).toBeCalledWith(expectedResponse);
    });

    test('with invalid "authorization" header', async () => {
        const expectedResponse = {
            "data": null,
            "error": new Error("Test Exception"),
            "isSuccessful": false,
            "message": "Invalid JWT token.",
            "statusCode": 401,
        };
        mockRequest = {
            headers: {
                "authorization" : "Bearer abs",
            },
        }
        const authMiddleware = new Authentication();
        const authFunc = authMiddleware.getAuthenticationMiddleware();

        await authFunc(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.send).toBeCalledWith(expectedResponse);
    });

    test.skip('with "authorization" header', async () => {
        mockRequest = {
            headers: {
                'authorization': 'Bearer abc',
            },
        }
        const authMiddleware = new Authentication();
        const authFunc = authMiddleware.getAuthenticationMiddleware();
        
        await authFunc(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toBeCalledTimes(1);
    });
});