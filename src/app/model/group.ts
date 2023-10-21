import { Admin } from './admin';
import { Config } from './config';

export class Group {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  activated: Map<string, boolean>;
  config: Config[];
  admin: Admin;
}