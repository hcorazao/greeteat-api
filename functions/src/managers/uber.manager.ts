import UberService from "../services/uberService";
import { MeetingsRepository } from "../repository/meetings.repository";
import CreateVoucherDto from "../models/createVoucher.model";
import RedeemCode from "../models/redeemCode.model";
import RedeemCodes from "../models/redeemCodes.model";
import { GeResponse } from "../models/response.model";

export class UberManager {
    private uberService: UberService;
    private meetingsRepo: MeetingsRepository;

    constructor() {
        this.uberService = UberService.getInstance();
        this.meetingsRepo = new MeetingsRepository();
    }
    
    public async getVoucher(voucherId:string, userId:string) {
        // check if user allowed to get the Voucher.
        return this.uberService.getVoucher(voucherId);
    }

    public async createVoucher(newVoucher: CreateVoucherDto, userId:string) {
        const uberResponse = await this.uberService.createVoucher(newVoucher);

        if (!uberResponse.isSuccessful) {
            return uberResponse;
        }
         
        const repoResponse = await this.meetingsRepo.setVoucherId(newVoucher.meetingId, uberResponse.data.voucher_program_id);

        if (!repoResponse.isSuccessful) {
            return repoResponse;
        }

        const setRedeemCodesResponse = await this.setVoucherRedeemCodes(uberResponse.data.voucher_program_id, userId, newVoucher.meetingId);

        if (!setRedeemCodesResponse.isSuccessful) {
            return setRedeemCodesResponse;
        }

        return uberResponse;
    }

    public async setVoucherRedeemCodes(voucherId:string, userId:string, meetingId:string="") {

        let meetingIdToUse:string;

        if (meetingId) {
            meetingIdToUse = meetingId;
        } else {
            const meetingResponse = await this.meetingsRepo.getMeetingByVoucherId(voucherId, userId);
            const meetingIdFromResponse = meetingResponse.data?.Id;
    
            if (!meetingIdFromResponse) {
                return meetingResponse;
            }

            meetingIdToUse = meetingIdFromResponse;
        }

        const redeemCodes = await this.getRedeemCodes(voucherId, userId);

        if (redeemCodes.isSuccessful && redeemCodes.data && redeemCodes.data instanceof RedeemCodes) {
            const repoResponse = await this.meetingsRepo.setUberVoucherRedeemCodes(meetingIdToUse, redeemCodes.data, userId); 
            
            if (!repoResponse.isSuccessful) {
                return repoResponse;
            }
        }

        return redeemCodes;
    }

    public async setVoucherRedeemStatus(voucherId:string, userId:string) {
        const meetingResponse = await this.meetingsRepo.getMeetingByVoucherId(voucherId, userId);
        const meetingId = meetingResponse.data?.Id;

        if (!meetingId) {
            return meetingResponse;
        }

        const redeemCodes = await this.getRedeemCodes(voucherId, userId);

        if (redeemCodes.isSuccessful && redeemCodes.data && redeemCodes.data instanceof RedeemCodes) {
            const repoResponse = await this.meetingsRepo.setUberVoucherStatus(meetingId, userId); 
            
            if (!repoResponse.isSuccessful) {
                return repoResponse;
            }
        }

        return redeemCodes;
    }

    public async getRedeemCodes(voucherId:string, userId:string):Promise<GeResponse<RedeemCodes | Object>> {
        // check if user allowed to get the Voucher Codes.
        const response = await this.uberService.getRedeemCodes(voucherId);

        if (response.isSuccessful && response.data && typeof response.data === "object") {
            if (Array.isArray(response.data.codes)) {

                const redeemCodes:RedeemCode[] = response.data.codes.map((x: { code_text: string; redemption_link: string; max_num_redemptions:number}) => {
                    return new RedeemCode(x.code_text, x.redemption_link, x.max_num_redemptions);
                });

                const redeemCodesResult:RedeemCodes = new RedeemCodes(redeemCodes.length, redeemCodes);

                response.data = redeemCodesResult;
            }
        }

        return response;
    }

    public async generateRedeemCodes(voucherId:string, amount:number, userId:string):Promise<GeResponse<null>> {
        // check if user allowed to generate the Voucher.
        return this.uberService.generateRedeemCodes(voucherId, amount);
    }

    public async cancelVoucher(voucherId:string, userId:string):Promise<GeResponse<null>> {
        // check if user allowed to generate the Voucher.
        return this.uberService.cancelVoucher(voucherId);
    }
}
