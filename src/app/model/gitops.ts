export const TOKEN_VALUE = '********************************';

export class GitOpsAccount {
  ID?: string;
  repository: string;
  branch?: string;
  path?: string;
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

export class GitOpsAccountTokenResponse {
  result: boolean;
  message: string;
}

export function buildNewGitOpsAccount(environment: string, domainId: string, domainName: string): GitOpsAccount {
  return {
    environment,
    repository: '',
    branch: '',
    path: '',
    token: '',
    domain: {
      id: domainId,
      name: domainName,
      version: 0,
      lastcommit: 'refresh',
      lastdate: '',
      status: 'Pending',
      message: 'Creating GitOps Account'
    },
    settings: {
      active: true,
      window: '1m',
      forceprune: false
    }
  };
}