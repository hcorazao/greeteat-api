export class StripeWebhookDto {
    id: string;
    object: string;
    api_version: any;
    application: any;
    created: number;
    description: string;
    enabled_events: string[];
    livemode: boolean;
    metadata: any;
    status: string;
    url: string;

    constructor(
        id:string,
        object: string,
        api_version: any,
        application: any,
        created: number,
        description: string,
        enabled_events: string[],
        livemode: boolean,
        metadata: any,
        status: string,
        url: string) {
        this.id = id;
        this.object = object;
        this.api_version = api_version;
        this.application = application;
        this.created = created;
        this.description = description;
        this.enabled_events = enabled_events;
        this.livemode = livemode;
        this.metadata = metadata;
        this.status = status;
        this.url = url;
    }
}