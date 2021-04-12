import { IParticipant } from "./participant.interface";

export class Participant implements IParticipant {
  Email: string;
  IsNotificationSent: boolean;
  IsInvitationAccepted: boolean;
  RedeemCode: string;
  RedeemUrl: string;
  VoucherCodeStatus: string;

  constructor(email:string, isNotificationSent:boolean = false, isInvitationAccepted:boolean = false) {
    this.Email = email;
    this.IsInvitationAccepted = isInvitationAccepted;
    this.IsNotificationSent = isNotificationSent;
    this.RedeemCode = "";
    this.RedeemUrl = "";
    this.VoucherCodeStatus = "unclaimed";
  }
}
