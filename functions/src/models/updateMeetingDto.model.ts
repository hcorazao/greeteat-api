export class updateMeetingDto {
  id: string;
  topicName: string;
  startTime: Date;
  duration: number;
  participants: string[];
  voucherPrice: number;
  isSecured: boolean;
  passcode: string;
  description: string;  

    constructor(
      id:string,
      topicName: string,
      startTime: Date,
      duration: number,
      participants: string[],
      voucherPrice: number,
      isSecured: boolean,
      passcode: string,
      description: string) {
        this.id = id;
        this.topicName = topicName;
        this.startTime = startTime;
        this.duration = duration;
        this.participants = participants;
        this.voucherPrice = voucherPrice;
        this.isSecured = isSecured;
        this.passcode = passcode;
        this.description = description;
    }
}
