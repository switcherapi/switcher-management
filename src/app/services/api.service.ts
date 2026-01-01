import { throwError } from 'rxjs';

export class ApiService {
    
    handleError(error: any) {
        if (error.error instanceof ErrorEvent) {
            return throwError(() => `Error: ${error.error.message}`);
        }

        switch (error.status) {
            case 401:
                return throwError(() => error);
            case 422:
                return throwError(() => 'Invalid arguments');
            case 404:
                return throwError(() => error.error ?? 'Value not found');
            case 503:
            case 0:
                return throwError(() => 'Switcher API is offline');
            default:
                return throwError(() => error.error);
        }
    }
}