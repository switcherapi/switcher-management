export class GitOpsAccount {
    ID?: string;
    repository: string;
    branch?: string;
    token?: string;
    environment: string;
    domain: GitOpsDomain;
    settings: GitOpsSettings;
}

export class GitOpsDomain {
    id: string;
    name: string;
    version: number;
    lastcommit: string;
    lastdate: string;
    status: string;
    message: string;
}

export class GitOpsSettings {
    active: boolean;
    window: string;
    forceprune: boolean;
}