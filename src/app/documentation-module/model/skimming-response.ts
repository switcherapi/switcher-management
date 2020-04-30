export class SkimmingResponse {
    message: string;
    query: string;
    result: SkimmingResult[];
}

export class SkimmingResult {
    file: string;
    segment: string[];
    found: number;
    cache: boolean;
}

/*
{
    "message": "Success",
    "query": "expireDuration",
    "result": [
        {
            "file": "README.md",
            "segment": [
                "expireDuration: 10, size: 10 });",
                "expireDuration` the time in seconds that the cached value will expire (default: 1min)"
            ],
            "found": 2,
            "cache": false
        }
    ]
}
*/