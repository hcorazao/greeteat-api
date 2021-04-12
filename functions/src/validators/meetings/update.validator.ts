
import { ContainerTypes, ValidatedRequestSchema } from "express-joi-validation";
import Joi = require("joi");

export class UpdateMeetingValidator {

    get router():string {
        return "/meetings";
    }

    get querySchema() {
        const now = new Date(Date.now());

        const createMeetingQuerySchema = Joi.object({
            id: Joi.string().required().length(20),
            topicName: Joi.string().required().min(3).max(128),
            startTime: Joi.date().iso().required().min(now),
            duration: Joi.number().required().min(1).max(1440),
            participants: Joi.array().required().min(1).items(Joi.string().email()),
            voucherPrice: Joi.number().required().min(1),
            isSecured: Joi.boolean().required(),
            passcode: Joi.when('isSecured', {
                is: true,
                then: Joi.string().required().not().empty(),
                otherwise: Joi.string().allow('').max(0),
            }),
            description: Joi.string().allow('').max(2000),
        })

        return createMeetingQuerySchema;
    }
}
   
export interface IUpdateMeetingSchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        id: string,
        topicName: string,
        startTime: Date,
        duration: number,
        participants: string[],
        voucherPrice: number,
        isSecured: boolean,
        passcode: string,
        description: string,
    }
}