export class Slack {
    team_id: string;
    team_name: string;
    bot_scopes: string[];
    channel: string;
    is_enterprise: boolean;
    installed_at: number;
    tickets_opened: number;
    tickets_approved: number;
    tickets_denied: number;
    settings: Settings;
}

export class SlackInstallation {
    team_name: string;
    incoming_webhook_channel: string;
}

export class Settings {
    approvals: number;
}

export enum FEATURES {
    SLACK_INTEGRATION = 'SLACK_INTEGRATION',
    SLACK_UPDATE = 'SLACK_UPDATE'
}