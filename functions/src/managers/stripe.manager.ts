import { StripeService } from "../services/stripeService";
import { AuthHelper } from "../utils/firebaseAuth";
import { UsersRepository } from "../repository/user.repository";
import { StripeDto } from "../models/stripe/stripeDto.model";
import { GeResponse } from "../models/response.model";
import { MeetingsRepository } from "../repository/meetings.repository";

export class StripeManager {
    private service: StripeService;
    private authHelper: AuthHelper;
    private userRepo: UsersRepository;
    private meetingRepo: MeetingsRepository;

    constructor() {
        this.service = new StripeService;
        this.authHelper = AuthHelper.getInstance();
        this.userRepo = new UsersRepository();
        this.meetingRepo = new MeetingsRepository();
    }

    public async createUser(userId: string, description: string = ""): Promise<GeResponse<any>> {
        let response = new GeResponse<any>();
        
        try {
            const userDetails = await this.authHelper.getUserDetails(userId);

            if (userDetails.email) {
                const stripeResponse = 
                    await this.service.createCustomer(
                        userDetails.displayName ?? "",
                        userDetails.email,
                        userId,
                        description);

                const stripeId = stripeResponse.data.id;
    
                if (stripeResponse.isSuccessful) {
                    await this.userRepo.create(new StripeDto(userDetails.email, stripeId));
                    response.response201(stripeId, "Stripe user was created successfully.");
                } else {
                    response = stripeResponse;
                }
    
                
            } else {
                response.response404(`User with Id [${userId}] was not found.`);
            }
        } catch (error) {
            response.response500(error, "Failed to create Stripe user.");
        }

        return response;
    }

    public async authorizedHold(amount: number, token:string, meetingId: string, userId:string): Promise<GeResponse<any>> {
        let response = new GeResponse<any>();
        try {
            const userStripeId = await this.getUserStripeId(userId);

            const chargeResponse = 
                await this.service.authorizedHold(amount, token, meetingId, userId, userStripeId);

            if (chargeResponse.isSuccessful && chargeResponse.data) {
                const meetingResponse = await this.meetingRepo.setChargeId(meetingId, chargeResponse.data.id);

                if (meetingResponse.isSuccessful) {
                    response.response200(chargeResponse.data, "Authorize hold went well.");    
                } else {
                    response = meetingResponse;
                }
                
            } else {
                response = chargeResponse;
            }  
               
        } catch (error) {
            response.response500(error, "Failed to authorize hold.");
        }

        return response;
    }

    public async cancelHold(amount: number, token:string, meetingId: string, userId:string): Promise<GeResponse<any>> {
        let response = new GeResponse<any>();
        try {
            const refundResponse = 
                await this.service.cancelHold(token);

            if (refundResponse.isSuccessful && refundResponse.data) {
                const meetingResponse = await this.meetingRepo.setRefundId(meetingId, refundResponse.data.id);

                if (meetingResponse.isSuccessful) {
                    response.response200(refundResponse.data, "Refund went well.");    
                } else {
                    response = meetingResponse;
                }
                
            } else {
                response = refundResponse;
            }  
               
        } catch (error) {
            response.response500(error, "Failed to authorize hold.");
        }

        return response;
    }

    public async createSession(amount: number, meetingId: string, userId:string): Promise<GeResponse<any>> {
        let response = new GeResponse<any>();

        try {
            const userStripeId = await this.getUserStripeId(userId);

            const sessionResponse = 
                await this.service.createSession(amount, meetingId, userId, userStripeId);

            if (sessionResponse.isSuccessful && sessionResponse.data) {
                const meetingResponse = await this.meetingRepo.setChargeId(meetingId, sessionResponse.data.payment_intent);

                if (meetingResponse.isSuccessful) {
                    response.response200(sessionResponse.data, "Checkout session created successfully.");    
                } else {
                    response = meetingResponse;
                }
            } else {
                response = sessionResponse;
            }  
 
        } catch (error) {
            response.response500(error, "Failed to create checkout session.");
        }

        return response;
    }

    public async addCard(token:string, userId:string): Promise<GeResponse<any>> {
        let response = new GeResponse<any>();

        try {
            const userStripeId = await this.getUserStripeId(userId);

            const chargeResponse = 
                await this.service.addCard(token, userId, userStripeId);

            if (chargeResponse.isSuccessful) {
                response.response200(chargeResponse.data, "Credit card added successfully.");
            } else {
                response = chargeResponse;
            }  

        } catch (error) {
            response.response500(error, "Failed to add credit card.");
        }

        return response;
    }

    public async deleteCard(cardId:string, userId:string): Promise<GeResponse<any>> {
        let response = new GeResponse<any>();

        try {
            const userStripeId = await this.getUserStripeId(userId);

            const chargeResponse = 
                await this.service.deleteCard(cardId, userStripeId);

            if (chargeResponse.isSuccessful) {
                response.response200(chargeResponse.data, "Credit card deleted successfully.");
            } else {
                response = chargeResponse;
            }  

        } catch (error) {
            response.response500(error, "Failed to delete credit card.");
        }

        return response;
    }

    public async listCards(userId:string): Promise<GeResponse<any>> {
        let response = new GeResponse<any>();

        try {
            const userStripeId = await this.getUserStripeId(userId);

            const chargeResponse = 
                await this.service.listCards(userStripeId);

            if (chargeResponse.isSuccessful) {
                response.response200(chargeResponse.data, "Credit cards list received successfully.");
            } else {
                response = chargeResponse;
            }  

        } catch (error) {
            response.response500(error, "Failed to get credit cards list.");
        }

        return response;
    }

    private async getUserStripeId( userId:string): Promise<string> {
        const userDetails = await this.authHelper.getUserDetails(userId);

        if (userDetails.email) {
            const userResponse = await this.userRepo.get(userDetails.email);

            if (userResponse.isSuccessful && userResponse.data) {
                return userResponse.data.stripeId;
            }
        } else {
            throw new Error(`Failed to get user's email for Stripe request. userId:[${userId}].`);
        }

        throw new Error(`Failed to get user's Stripe customer id for Stripe request. userId:[${userId}].`);
    }

    public async constructEvent(body:any, signature:string, endpointSecret:string) {
        return this.service.constructEvent(body, signature, endpointSecret);
    }
}
