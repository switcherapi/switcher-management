export class Config {
  id: string;
  key: string;
  description: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  activated: Map<string, boolean>;
  disable_metrics: Map<string, boolean>;
  components: any[];
  relay: ConfigRelay;
}

export class ConfigRelay {
  type: string;
  description: string = '';
  activated: Map<string, boolean> = new Map<string, boolean>();
  endpoint: Map<string, string> = new Map<string, string>();
  method: string;
  auth_prefix: string = '';
  auth_token: Map<string, string> = new Map<string, string>();
  verified: boolean = false;
  verification_code: string;
}

export class ConfigRelayStatus {
  activated: Map<string, boolean> = new Map<string, boolean>();
}