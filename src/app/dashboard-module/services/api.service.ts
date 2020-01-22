import { throwError } from 'rxjs/internal/observable/throwError';

export class ApiService {
    
    handleError(error) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            if (error.status === 401) {
                return throwError(error);
            } else if (error.status === 422) {
                errorMessage = 'Invalid arguments';
            } else if (error.status === 0) {
                errorMessage = 'Switcher API is offline';
            } else {
                errorMessage = `Error Code: ${error.status} - Message: ${error.message} 
                    - Error: ${JSON.stringify(error.error)}`;
            }
        }
        return throwError(errorMessage);
    }
}