
import { ContainerTypes, ValidatedRequestSchema } from "express-joi-validation";
import Joi = require("joi");

export class CreateVoucherValidator {

    get router():string {
        return "/voucher";
    }

    get querySchema() {
        const now = new Date(Date.now()).getTime();

        const createMeetingQuerySchema = Joi.object({
            name: Joi.string().required().min(3).max(128),
            startTime: Joi.number().required().min(now),
            endTime: Joi.number().required().greater(Joi.ref('startTime')),
            participantAmount: Joi.number().required().min(1),
            voucherCost: Joi.number().required().min(1),
            meetingId: Joi.string().required().length(20),
        });

        return createMeetingQuerySchema;
    }
}
   
export interface ICreateVoucherSchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        name: string;
        startTime: number;
        endTime: number;
        participantAmount: number;
        voucherCost: number;
        meetingId: string;
    }
}