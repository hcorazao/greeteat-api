import { IMeeting } from './meeting.interface';
import { IParticipant } from './participant.interface';

export class Meeting implements IMeeting {
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

    constructor(
      topicName: string,
      startTime: string,
      duration: number,
      participants: IParticipant[],
      voucherPrice: number,
      isSecured: boolean,
      passcode: string,
      description: string,
      publicMeetingId: string,
      zoomMeetingId: string,
      userId: string) {
        this.Id = "";
        this.TopicName = topicName;
        this.StartTime = startTime;
        this.Duration = duration;
        this.Participants = participants;
        this.VoucherPrice = voucherPrice;
        this.IsSecured = isSecured;
        this.Passcode = passcode;
        this.Description = description;
        this.PublicMeetingId = publicMeetingId;
        this.ZoomMeetingId = zoomMeetingId;
        this.UserId = userId;
        this.IsDeleted = false;
        this.IsPrepayed = false;
        this.VoucherId = "";
        this.ChargeId = "";
        this.RefundId = "";
    }
}
