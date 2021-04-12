export class StripeDto {
    userEmail: string;
    stripeId: string;
    isDeleted: boolean;

    constructor(userName:string, stripeId: string) {
        this.userEmail = userName;
        this.stripeId = stripeId;
        this.isDeleted = false;
    }
}