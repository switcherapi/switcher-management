import { Config } from './config';
import { Injectable } from '@angular/core';

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

export class MetricStatisticsRequest {
    domainId: string;
    env: string;
    statistics = 'all';
    key?: string;
    type?: string;
    dateGroupPattern?: string;
    dateBefore?: string;
    dateAfter?: string;
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