import { GeResponse } from "../models/response.model";
import { StripeManager } from './stripe.manager';
import { AuthHelper } from "../utils/firebaseAuth";

const fakeId = "fake-id";

const stripeService_createUser_successResponse_data = { 
    id: fakeId, 
    isSuccessful: true,
};

const stripeService_createUser_successResponse = new GeResponse<any>();
stripeService_createUser_successResponse.response201(
    stripeService_createUser_successResponse_data,
    "Stripe User create.");

const stripeService_createUser = 
    jest.fn().mockReturnValue(stripeService_createUser_successResponse);

const stripeService_authorizedHold_successResponse = new GeResponse<any>();
stripeService_authorizedHold_successResponse.response200(
    stripeService_createUser_successResponse_data,
    "Authorize hold done.");

const stripeService_authorizedHold = 
    jest.fn().mockReturnValue(stripeService_authorizedHold_successResponse);

jest.mock("../services/stripeService", () => {
    return {
        StripeService: jest.fn(() => {
            return {
                createCustomer: stripeService_createUser,
                authorizedHold: stripeService_authorizedHold,
            };
        }),
    };
});

const firebaseAuth_getUserDetails_successResponse = {
    email: "fake-email@email.com",
    displayName: "fake-name",
};

const firebaseAuth_getUserDetails = 
    jest.fn().mockReturnValue(firebaseAuth_getUserDetails_successResponse);

jest.mock("../utils/firebaseAuth", () => {
    return {
        AuthHelper: jest.fn(() => {
            return {
                getInstance: () => jest.fn(() => {
                    return {
                        getUserDetails: firebaseAuth_getUserDetails,
                    };
                }),
            };
        }),
        getInstance: () => jest.fn(() => {
            return {
                getUserDetails: firebaseAuth_getUserDetails,
            };
        }),
    };
});

const usersRepository_create_successResponse = new GeResponse<string>();
usersRepository_create_successResponse.response204("Stripe Id was saved.");

const usersRepository_create = 
    jest.fn().mockReturnValue(usersRepository_create_successResponse);


const usersRepository_get_successResponse = new GeResponse<any>();
usersRepository_get_successResponse.response200(
    stripeService_createUser_successResponse_data,
    "Get response successed.");

const usersRepository_get = 
    jest.fn().mockReturnValue(usersRepository_get_successResponse);

jest.mock("../repository/user.repository", () => {
    return {
        UsersRepository: jest.fn(() => {
            return {
                create: usersRepository_create,
                get: usersRepository_get,
            };
        }),
    };
});

const meetingsRepository_setChargeId_successResponse = new GeResponse<any>();
meetingsRepository_setChargeId_successResponse.response200(
    stripeService_createUser_successResponse_data,
    "Get response successed.");

const meetingsRepository_setChargeId = 
    jest.fn().mockReturnValue(meetingsRepository_setChargeId_successResponse);

jest.mock("../repository/meetings.repository", () => {
    return {
        MeetingsRepository: jest.fn(() => {
            return {
                setChargeId: meetingsRepository_setChargeId,
            };
        }),
    };
});

describe("Stripe manager", () => {
    test('stripe manager - init successfully', async () => {

        AuthHelper.getInstance = jest.fn(() => {
            return {
                getUserDetails: firebaseAuth_getUserDetails,
                isUserValid: jest.fn(),
            };
        });

        const manager = new StripeManager();

        expect(manager).not.toBeNull();
    });

    test('stripe manager - createUser response 201', async () => {
        const manager = new StripeManager();
        const userId = "test-user-id";
        const description = "test-description";

        expect(manager).not.toBeNull();
        
        const response = await manager.createUser(userId, description);

        expect(response.isSuccessful).toBe(true);

        expect(response.statusCode).toBe(201);

        expect(response.data).toBe(fakeId);
        
        expect(response.message).toBe("Stripe user was created successfully.");
    });

    test('stripe manager - authorizedHold response 200', async () => {
        const manager = new StripeManager();
        const userId = "test-user-id";
        const meetingId = "test-meeting-id";
        const amoount = 10000;
        const token = "test-token";

        expect(manager).not.toBeNull();
        
        const response = await manager.authorizedHold(amoount, token, meetingId, userId);

        expect(response.isSuccessful).toBe(true);

        expect(response.statusCode).toBe(200);        
        
        expect(response.message).toBe("Authorize hold went well.");
    });

});
