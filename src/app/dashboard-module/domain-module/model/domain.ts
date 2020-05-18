import { Group } from './group';

export class Domain {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  activated: Map<string, boolean>;
  apiKey: string;
  group: Group[];
}