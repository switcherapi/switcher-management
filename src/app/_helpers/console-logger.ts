import { environment } from 'src/environments/environment';

export class ConsoleLogger {

    public static printError(error: string, object?: any) {
        if (!environment.production)
            console.error(error, object);
    }
}