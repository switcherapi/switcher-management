export class Slack {
    team_id: string;
    team_name: string;
    bot_scopes: string[];
    channel: string;
    is_enterprise: boolean;
    installed_at: number;
    tickets_opened: number;
    settings: Settings;
}

export class SlackInstallation {
    team_name: string;
    incoming_webhook_channel: string;
}

export class Settings {
    ignored_environments: string[];
    frozen_environments: string[];
}

export enum SETTINGS_PARAM {
    IGNORED_ENVIRONMENT = 'IGNORED_ENVIRONMENT',
    FROZEN_ENVIRONMENT = 'FROZEN_ENVIRONMENT'
};