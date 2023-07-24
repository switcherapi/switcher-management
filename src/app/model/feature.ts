export class FeatureRequest {
    feature: string;
    parameters?: Parameters;
}

export class FeatureResponse {
    status: boolean;
}

class Parameters {
    value: string;
}