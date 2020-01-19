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

/*
{
    "strategy": "TIME_VALIDATION",
    "operationsAvailable": {
        "strategy": "TIME_VALIDATION",
        "operations": [
            "BETWEEN",
            "LOWER",
            "GREATER"
        ],
        "format": "HH:mm",
        "validator": "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$"
    },
    "operationRequirements": [
        {
            "operation": "BETWEEN",
            "min": 2,
            "max": 2
        },
        {
            "operation": "LOWER",
            "min": 1,
            "max": 1
        },
        {
            "operation": "GREATER",
            "min": 1,
            "max": 1
        }
    ]
}
*/