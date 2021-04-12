import { IParticipant } from './participant.interface';

export interface IMeeting {
    Id: string;
    TopicName: string;
    StartTime: string;
    Duration: number;
    Participants: IParticipant[];
    VoucherPrice: number;
    IsSecured: boolean;
    Passcode: string;
    Description: string;
    PublicMeetingId: string;
    ZoomMeetingId: string;
    UserId: string;
    IsDeleted: boolean;
    IsPrepayed: boolean;
    VoucherId: string;
    ChargeId: string;
    RefundId: string;
}



