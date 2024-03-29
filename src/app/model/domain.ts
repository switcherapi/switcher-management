import { Admin } from './admin';
import { Group } from './group';

export class Domain {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  activated: Map<string, boolean>;
  group: Group[];
  transfer: boolean;
  integrations: Integrations;
  admin: Admin;
}

export class Integrations {
  slack: string;
  relay: RelaySettings;
}

export class RelaySettings {
  verification_code: string;
}