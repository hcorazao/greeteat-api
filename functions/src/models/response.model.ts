export class GeResponse<TType> {
    isSuccessful: boolean;
    statusCode: number;
    error: any | null;
    data: TType | null;
    message: string | null;

    constructor();
    
    constructor(
        isSuccesful?: boolean,
        responseType?: number,
        errors?: any,
        data?: TType,
        message?: string,        
    ) {
        this.isSuccessful = isSuccesful ?? false;
        this.statusCode = responseType ?? 0;
        this.error = errors ?? null;
        this.data = data ?? null;
        this.message = message ?? null;
    }

    response200(data: TType, message:string = "OK") {
        this.statusCode = 200;
        this.data = data;
        this.isSuccessful = true;
        this.message = message;
    }

    response201(data: TType, message:string = "Created") {
        this.statusCode = 201;
        this.data = data;
        this.isSuccessful = true;
        this.message = message;
    }

    response204(message:string = "No Content") {
        this.statusCode = 204;
        this.isSuccessful = true;
        this.message = message;
    }

    response400(message:string = "Bad request") {
        this.statusCode = 400;
        this.isSuccessful = false;
        this.message = message;
    }

    response401(message:string = "Unauthorized") {
        this.statusCode = 401;
        this.isSuccessful = false;
        this.message = message;
    }

    response403(message:string = "Forbidden") {
        this.statusCode = 403;
        this.isSuccessful = false;
        this.message = message;
    }

    response404(message:string = "Not Found") {
        this.statusCode = 404;
        this.isSuccessful = false;
        this.message = message;
    }
    
    response410(message:string = "Gone") {
        this.statusCode = 410;
        this.isSuccessful = false;
        this.message = message;
    }

    response422(message:string = "Unprocessable Entity ") {
        this.statusCode = 422;
        this.isSuccessful = false;
        this.message = message;
    }

    response500(error: any, message:string = "Internal Server Error") {
        this.statusCode = 500;
        this.error = error;
        this.isSuccessful = false;
        this.message = message;
    }
}