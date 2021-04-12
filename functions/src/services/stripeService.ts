import Stripe from "stripe";
import { GeResponse } from "../models/response.model";
import constants from "../utils/constants";

export class StripeService {
    public stripe:Stripe;
    
    constructor() {
        this.stripe = new Stripe(constants.Stripe.ApiKey, { apiVersion: "2020-08-27" });
    }

    async createCustomer(userName:string, email:string, userId: string, description:string = ""): Promise<GeResponse<any>> {

        const response = new GeResponse<any>();

        try {
            const stripeResponse = await this.stripe.customers.create({
                description: description,
                email: email,
                name: userName,
                metadata: {
                    userId: userId,
                },
            });
    
            response.response201(stripeResponse, "Stripe request for User create finished successfully.");
        
        } catch (error) {
            response.response500(error, "Failed to request for create a Stripe customer.");
        }

        return response;
    }

    async authorizedHold(amount: number, sourceToken:string, meetingId: string, userId:string, stripeCustomerId:string): Promise<GeResponse<any>> {

        const response = new GeResponse<any>();
        try {
            const stripeResponse = await this.stripe.charges.create({
                amount: amount,
                currency: 'usd',
                source: sourceToken,
                description: `greet-eat, amount: ${amount}, userId: ${userId}, meeting: ${meetingId}`,
                capture: false,
                metadata: {
                    meetingId: meetingId,
                    userId: userId,
                },
                customer: stripeCustomerId,
            });

            response.response200(stripeResponse, "Request for authorize hold finished successfully.");
        } catch (error) {
            response.response500(error, "Failed to request for authorize hold.");
        }

        return response;
    }

    async cancelHold(paymentIntentToken:string): Promise<GeResponse<any>> {

        const response = new GeResponse<any>();
        try {
            const stripeResponse = await this.stripe.paymentIntents.cancel(
                paymentIntentToken,
                { cancellation_reason: "requested_by_customer" }
            );

            response.response200(stripeResponse, "Request for canceling payment intent finished successfully.");
        } catch (error) {
            response.response500(error, "Failed to request for canceling payment intent.");
        }

        return response;
    }

    async createSession(amount: number, meetingId: string, userId:string, stripeCustomerId:string): Promise<GeResponse<any>> {

        const response = new GeResponse<any>();
        try {
            const stripeResponse = await this.stripe.checkout.sessions.create({
                payment_intent_data: {
                    setup_future_usage: 'off_session',
                    capture_method: 'manual',
                },
                payment_method_types: ['card'],
                customer: stripeCustomerId,
                line_items: [
                    {
                      price_data: {
                        currency: 'usd',
                        product_data: {
                          name: "Meeting",
                        },
                        unit_amount: amount,
                      },
                      quantity: 1,
                    },
                  ],
                mode: 'payment',
                success_url: 'https://greeteat-web-qa.web.app/meetings', // 'https://example.com/success',
                cancel_url: 'https://greeteat-web-qa.web.app/meetings',  // 'https://example.com/cancel',
                metadata: {
                    meetingId: meetingId,
                    userId: userId,
                },
            });

            response.response200(stripeResponse, "Request for create checkout session finished successfully.");
        } catch (error) {
            response.response500(error, "Failed to request for create checkout session.");
        }

        return response;
    }

    
    async addCard(sourceToken:string, userId:string, stripeCustomerId:string): Promise<GeResponse<any>> {

        const response = new GeResponse<Stripe.CustomerSource>();
        try {
            const stripeResponse = await this.stripe.customers.createSource(
                stripeCustomerId, 
                {
                    source: sourceToken, 
                    metadata: {
                        userId: userId,
                    },
                });

            response.response200(stripeResponse, "Request for add credit card finished successfully.");
        } catch (error) {
            response.response500(error, "Failed to request for add credit card.");
        }

        return response;
    }

    async deleteCard(cardId:string, stripeCustomerId:string): Promise<GeResponse<any>> {

        const response = new GeResponse<any>();
        try {
            const stripeResponse = await this.stripe.customers.deleteSource(
                stripeCustomerId, 
                cardId);

            response.response200(stripeResponse, "Request for delete credit card finished successfully.");
        } catch (error) {
            response.response500(error, "Failed to request for delete credit card.");
        }

        return response;
    }

    async listCards(stripeCustomerId:string): Promise<GeResponse<any>> {

        const response = new GeResponse<any>();
        try {
            const stripeResponse = await this.stripe.customers.listSources(
                stripeCustomerId, 
                {object: "card"});

            response.response200(stripeResponse, "Request for get all credit cards finished successfully.");
        } catch (error) {
            response.response500(error, "Failed to request for geting all credit cards.");
        }

        return response;
    }

    async constructEvent(body:any, signature:string, endpointSecret:string) {
        const response = new GeResponse<any>();
        try {
            const stripeResponse = this.stripe.webhooks.constructEvent(body, signature, endpointSecret);
            response.response200(stripeResponse, "ConstructEvent went well.");
        } catch (error) {
            response.response400("Failed to constructEvent.");
            response.error = error;
        }
        return response;
    }
}