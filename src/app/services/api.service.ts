import { throwError } from "rxjs";

export class ApiService {
    
    handleError(error) {
        let errorMessage = '';
        
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else if (error.status === 401) {
            return throwError(error);
        } else if (error.status === 422) {
            errorMessage = 'Invalid arguments';
        } else if (error.status === 404) {
            errorMessage = error.error || 'Value not found';
        } else if (error.status === 503 || error.status === 0) {
            errorMessage = 'Switcher API is offline';
        } else {
            errorMessage = error.error;
        }

        return throwError(errorMessage);
    }
}