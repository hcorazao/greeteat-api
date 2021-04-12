import MeetingsController from "./meetings.controller";
import * as express from 'express';
import { ValidatedRequest } from "express-joi-validation";
import { IQueryIdSchema } from "../validators/meetings/add.validator";
import { GeResponse } from "../models/response.model";
import { Meeting } from "../models/meeting.model";
import { Participant } from "../models/participant.model";

interface IDictionary {
    [key: string]: any;
}

declare module "express" { 
    export interface Request {
      userid: any
    }
  }

const fakeMeeting = new Meeting(
    "test meeting",
    new Date().toISOString(),
    30,
    [
        new Participant(
        "test@test.com",
        false,
        false,
        ),
    ],
    10,
    true,
    "passcode",
    "description",
    "public-meeting-id",
    "zoom-meeting-id",
    "user-id");

const mockFirebaseResponse204 = new GeResponse<boolean>();            
mockFirebaseResponse204.statusCode = 204;
mockFirebaseResponse204.data = true;

const mockFirebaseResponse201 = new GeResponse<string>();            
mockFirebaseResponse201.statusCode = 204;
mockFirebaseResponse201.data = "some-fake-id";

const mockFirebaseResponse200 = new GeResponse<Meeting>();
mockFirebaseResponse200.response200(fakeMeeting, "test Get response success.");

const mockRepositoryCreate = jest.fn().mockReturnValue(mockFirebaseResponse201);
const mockRepositoryUpdate = jest.fn().mockReturnValue(mockFirebaseResponse204);
const mockRepositoryDelete = jest.fn().mockReturnValue(mockFirebaseResponse204);
const mockRepositoryGet = jest.fn().mockReturnValue(mockFirebaseResponse200);

jest.mock('../repository/meetings.repository', () => {
    return {
        MeetingsRepository: jest.fn(() => {
            return {
                create: mockRepositoryCreate,
        
                update: mockRepositoryUpdate,

                delete: mockRepositoryDelete,

                get: mockRepositoryGet,
            };
        }),
    }
});

const mockManagersDelete = jest.fn().mockReturnValue(mockFirebaseResponse204);

jest.mock('../managers/meeting.manager', () => {
    return {
        MeetingManager: jest.fn(() => {
            return {
                delete: mockManagersDelete,
            };
        }),
    }
});

jest.mock("../managers/uber.manager", () => {
    return {
        UberManager: jest.fn(() => {
            return {
                getVoucher: mockRepositoryGet,
        
                createVoucher: mockRepositoryCreate,
            };
        }),
    }
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

    request.userid = jest.fn();
    request.userid = "fake-id";

    return request;
};

function getMockRequest():ValidatedRequest<IQueryIdSchema> {
    const request = {
        query: {
            "id": "some-id",
        },
    } as ValidatedRequest<IQueryIdSchema>;

    request.get = jest.fn((x:any) => {
        return ["Host:some-host","Host:some-host"] as any;
    });

    request.params = jest.fn() as jest.Mocked<IDictionary>;
    request.params.id = "fake-id";

    request.userid = jest.fn();
    request.userid = "fake-id";

    return request;
}

async function testEndpoint(firebaseResponse:any, statusCode: number, methodToTest: Function, getMock: Function, mockRepository:jest.Mock<any, any>) {
    const controller = new MeetingsController();

    expect(controller).not.toBeNull();

    const request = getMock();

    const response = mockResponse();

    mockRepository.mockReturnValue(firebaseResponse);
    mockManagersDelete.mockReturnValue(firebaseResponse);

    await methodToTest(request, response);

    expect(response.status).toHaveBeenCalledWith(statusCode);

    expect(response.json).toHaveBeenCalledTimes(1);
}

async function testGetEndpoint(firebaseResponse:any, statusCode: number) {
    await testEndpoint(firebaseResponse, statusCode, new MeetingsController().getMeeting, getMockRequest, mockRepositoryGet);
}

async function testCreateEndpoint(firebaseResponse:any, statusCode: number) {
    await testEndpoint(firebaseResponse, statusCode, new MeetingsController().createMeeting, mockRequest, mockRepositoryCreate);
}

async function testUpdateEndpoint(firebaseResponse:any, statusCode: number) {
    await testEndpoint(firebaseResponse, statusCode, new MeetingsController().editMeeting, mockRequest, mockRepositoryUpdate);
}

async function testDeleteEndpoint(firebaseResponse:any, statusCode: number) {
    await testEndpoint(firebaseResponse, statusCode, new MeetingsController().deleteMeeting, getMockRequest, mockRepositoryDelete);
}

describe('Meeting controllers', () => {
    beforeEach(() => {
        mockRepositoryCreate.mockClear();
        mockRepositoryUpdate.mockClear();
    });

    test('meeting controllers - init successfully', async () => {

        const controller = new MeetingsController();

        expect(controller).not.toBeNull();
    });

    test('meeting controllers - create returns Created(201)', async () => {
        const repoResponse = new GeResponse<Meeting>();
        repoResponse.response201(fakeMeeting);

        await testCreateEndpoint(repoResponse, 201);
    });

    test('meeting controllers - create return Unprocessable Entity(422)', async () => {
        const repoResponse = new GeResponse<Meeting>();
        repoResponse.response422();

        await testCreateEndpoint(repoResponse, 422);
    });

    test('meeting controllers - create return Server error(500)', async () => {
        const repoResponse = new GeResponse<Meeting>().response500("error");

        await testCreateEndpoint(repoResponse, 500);
    });

    test('meeting controllers - update returns No Content(204)', async () => {
        const repoResponse = new GeResponse<Meeting>();
        repoResponse.response204();

        await testUpdateEndpoint(repoResponse, 204);
    });

    test('meeting controllers - update returns Server error(500)', async () => {
        const repoResponse = new GeResponse<Meeting>().response500("error");

        await testUpdateEndpoint(repoResponse, 500);
    });

    test('meeting controllers - delete returns No Content(204)', async () => {
        const repoResponse = new GeResponse<Meeting>();
        repoResponse.response204();

        await testDeleteEndpoint(repoResponse, 204);
    });

    test('meeting controllers - delete returns Server error(500)', async () => {
        const repoResponse = new GeResponse<Meeting>().response500("error");

        await testDeleteEndpoint(repoResponse, 500);
    });

    test('meeting controllers - get returns Success(200)', async () => {
        const repoResponse = new GeResponse<Meeting>();
        repoResponse.response200(fakeMeeting);

        await testGetEndpoint(repoResponse, 200);
    });

    test('meeting controllers - get returns Not found(404)', async () => {
        const repoResponse = new GeResponse<Meeting>();
        repoResponse.response404();

        await testGetEndpoint(repoResponse, 404);
    });

    test('meeting controllers - get returns Gone(410)', async () => {
        const repoResponse = new GeResponse<Meeting>();
        repoResponse.response410();

        await testGetEndpoint(repoResponse, 410);
    });

    test('meeting controllers - get returns Error(500)', async () => {
        const repoResponse = new GeResponse<Meeting>();
        repoResponse.response500("Test Error");

        await testGetEndpoint(repoResponse, 500);
    });

    test('meeting controllers - get returns Error(500) from catch', async () => {
        const repoResponse = new GeResponse<Meeting>().response500("Test Error");

        await testGetEndpoint(repoResponse, 500);
    });
});