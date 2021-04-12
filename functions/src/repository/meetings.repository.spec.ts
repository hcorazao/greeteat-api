import { Meeting } from '../models/meeting.model';
import { Participant } from '../models/participant.model';
import GeFirestoreDatabase from '../utils/firebase';
import {MeetingsRepository} from "./meetings.repository";

describe('Meeting repository', () => {

    const validMeeting = new Meeting(
        "test meeting",
        new Date().toISOString(),
        new Date().toISOString(),
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
        "fake-user-id");

    const mockWithConverter = jest.fn(() => {
        return {
            add: jest.fn().mockReturnValue({
                id: "fake-id3",
            }),
            set: jest.fn(),
            get: jest.fn().mockReturnValue({
                id: "fake-id",
                exists: true,
                empty: false,
                docs: [
                    {
                        id: "fake-id",
                        exists: true,
                        data() {return validMeeting},
                    },
                ],
                join: jest.fn(),
            }),
            delete: jest.fn(),
            update: jest.fn(),
        }            
    });  

    const mockCollection = jest.fn(() => {
        return {
            withConverter: mockWithConverter,
            doc: jest.fn(() => {
                return {
                    update: jest.fn(),
                    withConverter: mockWithConverter,
                    join: jest.fn(),
                }            
            }),
            where: jest.fn(() => {
                return {
                    where: jest.fn(() => {
                        return {
                            withConverter: mockWithConverter,
                        }
                    }),
                    withConverter: mockWithConverter,
                }
            }),
        }
    });    

    const mockGetInstance = jest.fn();

    mockGetInstance.mockReturnValue({
        getStore: {
            collection: mockCollection,
        },
    });

    function getMock(mock: any) {
    
        const mockCollection1 = jest.fn(() => {
            return {
                withConverter: mock,
                doc: jest.fn(() => {
                    return {
                        update: jest.fn(),
                        withConverter: mock,
                    }            
                }),
                where: jest.fn(() => {
                    return {
                        where: jest.fn(() => {
                            return {
                                withConverter: mockWithConverter,
                            }
                        }),
                        withConverter: mockWithConverter,
                    }
                }),
            }
        });
    
        const mockGetInstance1 = jest.fn();
    
        mockGetInstance1.mockReturnValue({
            getStore: {
                collection: mockCollection1,
            },
        });

        return mockGetInstance1;
    }
    
    beforeEach(() => {
        GeFirestoreDatabase.getInstance = mockGetInstance;
    });

    test('meeting repository - create successfully', async () => {

        expect(validMeeting).not.toBeNull();

        const meeetingRepository = new MeetingsRepository(GeFirestoreDatabase.getInstance().getStore);

        expect(meeetingRepository).not.toBeNull();

        const createResponse = await meeetingRepository.create(validMeeting);

        expect(createResponse).not.toBeNull();

        expect(createResponse.isSuccessful).toBeTruthy();
    });

    test('meeting repository - create response 500', async () => {

        expect(validMeeting).not.toBeNull();

        const mockWithConverter1 = jest.fn(() => {
            throw new Error("Fake error");
        });

        const meeetingRepository = new MeetingsRepository(getMock(mockWithConverter1)().getStore);

        expect(meeetingRepository).not.toBeNull();

        const createResponse = await meeetingRepository.create(validMeeting);

        expect(createResponse).not.toBeNull();

        expect(createResponse.isSuccessful).toBeFalsy();
        expect(createResponse.statusCode).toEqual(500);
    });

    test('meeting repository - update successfully', async () => {

        expect(validMeeting).not.toBeNull();

        const meeetingRepository = new MeetingsRepository(GeFirestoreDatabase.getInstance().getStore);

        expect(meeetingRepository).not.toBeNull();

        const createResponse = await meeetingRepository.update(validMeeting);

        expect(createResponse).not.toBeNull();

        expect(createResponse.isSuccessful).toBeTruthy();
    });

    test('meeting repository - update response 500', async () => {

        expect(validMeeting).not.toBeNull();

        const mockWithConverter1 = jest.fn(() => {
            throw new Error("Fake error");
        });

        const meeetingRepository = new MeetingsRepository(getMock(mockWithConverter1)().getStore);

        expect(meeetingRepository).not.toBeNull();

        const createResponse = await meeetingRepository.update(validMeeting);

        expect(createResponse).not.toBeNull();

        expect(createResponse.isSuccessful).toBeFalsy();
        expect(createResponse.statusCode).toEqual(500);
    });

    test('meeting repository - get successfully', async () => {

        const meetingId = "fake-id";

        expect(validMeeting).not.toBeNull();

        const meeetingRepository = new MeetingsRepository(GeFirestoreDatabase.getInstance().getStore);

        expect(meeetingRepository).not.toBeNull();

        const createResponse = await meeetingRepository.get(meetingId, "fake-user-id");

        expect(createResponse).not.toBeNull();

        expect(createResponse.isSuccessful).toBeTruthy();
    });

    test('meeting repository - get response 404', async () => {

        const meetingId = "fake-meeting-id";

        expect(validMeeting).not.toBeNull();

        const mockWithConverter1 = jest.fn(() => {
            return {
                add: jest.fn().mockReturnValue({
                    id: "fake-id3",
                }),
                set: jest.fn(),
                get: jest.fn().mockReturnValue({
                    id: "fake-id",
                    exists: false,
                    data() {return { id: "fake-id"}},
                    empty: true,
                    docs: [
                        {
                            id: "fake-id",
                            exists: true,
                            data() {return { id: "fake-id"}},
                        },
                    ],
                    join: jest.fn(),
                }),
                delete: jest.fn(),
            }  
        });

        const meeetingRepository = new MeetingsRepository(getMock(mockWithConverter1)().getStore);

        expect(meeetingRepository).not.toBeNull();

        const createResponse = await meeetingRepository.get(meetingId, "fake-user-id");

        expect(createResponse).not.toBeNull();

        expect(createResponse.isSuccessful).toBeFalsy();
        expect(createResponse.statusCode).toEqual(404);
    });

    test('meeting repository - get response 500', async () => {

        const meetingId = "fake-meeting-id";

        expect(validMeeting).not.toBeNull();

        const mockCollection1 = jest.fn(() => {
            return {
                withConverter: jest.fn(() => {
                    throw new Error()
                }),
                doc: jest.fn(() => {
                    throw new Error()
                }),
                where: jest.fn(() => {
                    throw new Error()
                }),
            }
        });

        const mock = jest.fn().mockReturnValue({
            getStore: {
                collection: mockCollection1,
            },
        });

        const meeetingRepository = new MeetingsRepository(mock().getStore);

        expect(meeetingRepository).not.toBeNull();

        const createResponse = await meeetingRepository.get(meetingId, "fake-user-id");

        expect(createResponse).not.toBeNull();

        expect(createResponse.isSuccessful).toBeFalsy();
        expect(createResponse.statusCode).toEqual(500);
    });

    test('meeting repository - delete successfully', async () => {

        const meetingId = "fake-id";

        expect(validMeeting).not.toBeNull();

        const meeetingRepository = new MeetingsRepository(GeFirestoreDatabase.getInstance().getStore);

        expect(meeetingRepository).not.toBeNull();

        const createResponse = await meeetingRepository.delete(meetingId, "fake-user-id");

        expect(createResponse).not.toBeNull();

        expect(createResponse.isSuccessful).toBeTruthy();
    });

    test('meeting repository - delete response 500', async () => {

        const meetingId = "fake-meeting-id";

        expect(validMeeting).not.toBeNull();

        const mockCollection1 = jest.fn(() => {
            return {
                withConverter: jest.fn(() => {
                    throw new Error()
                }),
                doc: jest.fn(() => {
                    throw new Error()
                }),
                where: jest.fn(() => {
                    throw new Error()
                }),
            }
        });

        const mock = jest.fn().mockReturnValue({
            getStore: {
                collection: mockCollection1,
            },
        });

        const meeetingRepository = new MeetingsRepository(mock().getStore);

        expect(meeetingRepository).not.toBeNull();

        const createResponse = await meeetingRepository.delete(meetingId, "fake-user-id");

        expect(createResponse).not.toBeNull();

        expect(createResponse.isSuccessful).toBeFalsy();
        expect(createResponse.statusCode).toEqual(500);
    });
});