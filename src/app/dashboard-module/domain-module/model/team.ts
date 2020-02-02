import { Role } from './role';

export class Team {
  _id: string;
  name: string;
  active: boolean;
  roles: Role[];
  members: any[];
}