import { GeResponse } from "../models/response.model";
import { MeetingsRepository } from "../repository/meetings.repository";
import { StripeService } from "../services/stripeService";
import UberService from "../services/uberService";

export class MeetingManager {
    private stripeService: StripeService;
    private uberService: UberService;
    private meetingRepo: MeetingsRepository;

    constructor() {
        this.stripeService = new StripeService();
        this.uberService = new UberService();
        this.meetingRepo= new MeetingsRepository();
        
    }

    // public async editMeeting() {

    // }

    public async delete(meetingId:string, userId:string): Promise<GeResponse<any>> {

        try {            
            const meeting = await this.meetingRepo.get(meetingId, userId);
        
            if (meeting.isSuccessful && meeting.data) {
                const uberResponse = await this.uberService.cancelVoucher(meeting.data.VoucherId);

                if (uberResponse.isSuccessful) {
                    
                const stripeResponse = await this.stripeService.cancelHold(meeting.data.ChargeId);
                stripeResponse.isSuccessful = true;

                if (stripeResponse.isSuccessful) {
                    const deleteResponse = await this.meetingRepo.delete(meetingId, userId);

                    if (!deleteResponse.isSuccessful) {
                        deleteResponse.data = meeting;
                    }

                    return deleteResponse;
                } else {
                    // stripeResponse.data = meeting;
                    return stripeResponse;
                }
                } else {
                    // uberResponse.data = meeting;
                    return uberResponse;
                }
            } else {
                return meeting;
            }
        } catch (error) {
        const response = new GeResponse<any>();
        response.response500(error, "Failed to delete Meeting.");

        return response;
        }
    }
}