export class JsonReader {

    public static payloadReader(payload: any): string[] {
        let payloadRead = payload + '' === payload || payload || 0;
        if (Array.isArray(payloadRead)) {
            return payloadRead.flatMap(p => JsonReader.payloadReader(p));
        }
        
        return Object.keys(payloadRead)
            .flatMap(field => [field, ...JsonReader.payloadReader(payload[field])
            .map(nestedField => `${field}.${nestedField}`)])
            .filter(field => isNaN(Number(field)))
            .reduce((acc, curr) => {
                if (!acc.includes(curr)) {
                    acc.push(curr);
                }
                return acc;
            }, []);
    }

    public static isValidJSONString(value: string): boolean {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === "object";
        } catch (e) {
            return false;
        }
    }
    
}