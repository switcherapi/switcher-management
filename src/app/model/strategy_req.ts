export class StrategyReq {
    strategy: string;
    operationsAvailable: OperationSpec;
    operationRequirements: OperationReq[];
}

export class OperationSpec {
    strategy: string;
    operations: string[];
    format: string;
    validator: string;
}

export class OperationReq {
    operation: string;
    min: number;
    max: number;
}

export const MAX_VALUE_LENGTH = 500;