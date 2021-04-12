export default class VoucherDetailsDto {
    isDisabled: boolean; // is_disabled
    name: string;
    description: string;
    expenseMemo: any; // expense_memo
    startsAt: number; // starts_at
    endsAt: number; // ends_at
    createdAt: number; // created_at
    valuePerTrip: number; // value_per_trip_max_amount

    constructor(
        isDisabled: boolean,
        name: string,
        description: string,
        expenseMemo: any,
        startsAt: number,
        endsAt: number,
        createdAt: number,
        valuePerTrip: number) {
        this.isDisabled = isDisabled;
        this.name = name;
        this.description = description;
        this.expenseMemo = expenseMemo;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.createdAt = createdAt;
        this.valuePerTrip = valuePerTrip;
    }
}
