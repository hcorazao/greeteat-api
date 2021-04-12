import RedeemCode from "./redeemCode.model";

export default class RedeemCodes {
    amount: number;
    redeemCodes: RedeemCode[];

    constructor(
        amount: number,
        redeemCodes:RedeemCode[] ) {
        this.amount = amount;
        this.redeemCodes = redeemCodes;
    }
}
