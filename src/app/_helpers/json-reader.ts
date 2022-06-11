export class JsonReader {

    public static payloadReader(payload: any): string[] {
        let payloadRead = payload + '' === payload || payload || 0;
        if (Array.isArray(payloadRead))
            payloadRead = payloadRead[0];
        
        return Object.keys(payloadRead)
            .flatMap(field => [field, ...JsonReader.payloadReader(payload[field])
            .map(nestedField => `${field}.${nestedField}`)])
            .filter(field => isNaN(Number(field)));
    }

    public static isValidJSONString(value: string): boolean {
        try {
            JSON.parse(value);
        } catch (e) {
            return false;
        }
        return true;
    }
    
}