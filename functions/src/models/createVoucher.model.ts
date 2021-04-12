export default class CreateVoucherDto {
    name: string;
    startTime: number;
    endTime: number;
    participantAmount: number;
    voucherCost: number;
    meetingId: string;

    constructor(
        name: string,
        startTime: number,
        endTime: number,
        participantAmount: number,
        voucherCost: number,
        meetingId: string) {
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.participantAmount = participantAmount;
        this.voucherCost = voucherCost;
        this.meetingId = meetingId;
    }
}
