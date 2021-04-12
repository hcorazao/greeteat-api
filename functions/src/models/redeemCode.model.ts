export default class RedeemCode {
    code: string; //code_text
    link: string; //redemption_link
    maxRedemptions: number; //max_num_redemptions

    constructor(
        code: string,
        link:string,
        maxRedemptions:number) {
        this.code = code;
        this.link = link;
        this.maxRedemptions = maxRedemptions;
    }
}
