import { Role } from './role';
import { Injectable } from "@angular/core";

@Injectable()
export class Team {
  _id: string;
  name: string;
  active: boolean;
  roles: Role[];
  members: any[];
  domain: string;
}