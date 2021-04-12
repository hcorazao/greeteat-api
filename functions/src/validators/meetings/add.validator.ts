import { ContainerTypes, ValidatedRequestSchema } from "express-joi-validation";
import Joi = require("joi");

export class QueryIdValidator {

    get router():string {
        return "/meetings";
    }

    get querySchema() {
        const createMeetingQuerySchema = Joi.object({
            id: Joi.string().required().length(20),
        })

        return createMeetingQuerySchema;
    }
}
   
export interface IQueryIdSchema extends ValidatedRequestSchema {
    [ContainerTypes.Query]: {
        id: string
    }
}