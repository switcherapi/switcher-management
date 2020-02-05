import { Config } from './config';

export class Metric {
    statistics: MetricStatistics;
    data: MetricData[];
}

export class MetricStatistics {
    total: number;
    positive: number;
    negative: number;
    date_from: Date;
    date_to: Date;
    reasons: MetricReason[];
    switchers: MetricSwitcher[];
    components: MetricComponent[];
}

export class MetricReason {
    reason: string;
    total: number;
}

export class MetricSwitcher {
    switcher: string;
    total: number;
    positive: number;
    negative: number;
}

export class MetricComponent {
    component: string;
    total: number;
    positive: number;
    negative: number;
}

export class MetricData {
    config: Config;
    component: string;
    entry: StrategyDataEntry[];
    result: boolean;
    reason: string;
    environment: string;
    date: Date;
}

class StrategyDataEntry {
    strategy: string;
    input: string;
}

/*
{
    "statistics": {
        "total": 7,
        "positive": 3,
        "negative": 4,
        "date_from": "2020-02-04T04:15:04.591Z",
        "date_to": "2020-02-04T04:48:28.443Z",
        "reasons": [
            {
                "reason": "Strategy 'NETWORK_VALIDATION' does not agree",
                "total": 3
            },
            {
                "reason": "Success",
                "total": 3
            },
            {
                "reason": "Strategy 'VALUE_VALIDATION' does not agree",
                "total": 1
            }
        ],
        "switchers": [
            {
                "switcher": "FEATURE2020",
                "total": 4,
                "positive": 1,
                "negative": 3
            },
            {
                "switcher": "FEATURE02",
                "total": 3,
                "positive": 2,
                "negative": 1
            }
        ],
        "components": [
            {
                "component": "Android",
                "total": 5,
                "positive": 2,
                "negative": 3
            },
            {
                "component": "Windows",
                "total": 2,
                "positive": 1,
                "negative": 1
            }
        ]
    },
    "data": [
        {
            "config": {
                "key": "FEATURE2020"
            },
            "component": "Android",
            "entry": [
                {
                    "_id": "5e38efc889e5230b68d9d086",
                    "strategy": "VALUE_VALIDATION",
                    "input": "Roger"
                },
                {
                    "_id": "5e38efc889e5230b68d9d085",
                    "strategy": "NETWORK_VALIDATION",
                    "input": "10.0.0.3"
                }
            ],
            "result": false,
            "reason": "Strategy 'NETWORK_VALIDATION' does not agree",
            "group": "Project 2",
            "environment": "default",
            "date": "2020-02-03 20:15:04"
        }
    ]
}

*/