export default class UberUpdateDto {
    organizationId: string;
    eventType: string;
    campaignOrganizationId: string;
    voucherId: string;
    resourceHref: string;
    usageVoucherClaimCount: number; // voucher_program_code_claimed only
    usageTripCount: number; // voucher_program_code_redeemed
    usageAmount: number; // voucher_program_code_claimed voucher_program_code_redeemed
    usageAmountCurrency: string; // voucher_program_code_claimed voucher_program_code_redeemed
    isDisabled: boolean; // voucher_program_completed

    constructor(
        organizationId: string,
        eventType: string,
        campaignOrganizationId: string,
        voucherId: string,
        resourceHref: string,
        usageVoucherClaimCount:number = 0,
        usageTripCount:number = 0,
        usageAmount: number = 0,
        usageAmountCurrency: string = "USD",
        isDisabled: boolean = false,
        ) {
        this.organizationId = organizationId;
        this.eventType = eventType;
        this.campaignOrganizationId = campaignOrganizationId;
        this.voucherId = voucherId;
        this.usageVoucherClaimCount = usageVoucherClaimCount;
        this.isDisabled = isDisabled;
        this.usageTripCount = usageTripCount;
        this.usageAmount = usageAmount;
        this.usageAmountCurrency = usageAmountCurrency;
        this.resourceHref = resourceHref;
    }
}
