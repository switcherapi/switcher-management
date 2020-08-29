import { Config } from './config';
import { Injectable } from "@angular/core";

@Injectable()
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
    dateTimeStatistics: DateTimeStatistics[];
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
    message: string;
    environment: string;
    date: Date;
}

class DateTimeStatistics {
    date: string;
    positive: number;
    negative: number;
}

class StrategyDataEntry {
    strategy: string;
    input: string;
}

/*
{
    "statistics": {
        "total": 4,
        "positive": 1,
        "negative": 3,
        "date_from": "2020-02-04T04:15:04.591Z",
        "date_to": "2020-02-04T04:17:01.830Z",
        "reasons": [
            {
                "reason": "Strategy 'NETWORK_VALIDATION' does not agree",
                "total": 3
            },
            {
                "reason": "Success",
                "total": 1
            }
        ],
        "switchers": [
            {
                "switcher": "FEATURE2020",
                "total": 4,
                "positive": 1,
                "negative": 3,
                "dateTimeStatistics": [
                    {
                        "date": "2020-02-03 20:15",
                        "total": 1
                    },
                    {
                        "date": "2020-02-03 20:16",
                        "total": 2
                    },
                    {
                        "date": "2020-02-03 20:17",
                        "total": 1
                    }
                ]
            }
        ],
        "components": [
            {
                "component": "Android",
                "total": 4,
                "positive": 1,
                "negative": 3
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