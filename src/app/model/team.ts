import { Permission } from './permission';
import { Injectable } from "@angular/core";

@Injectable()
export class Team {
  _id: string;
  name: string;
  active: boolean;
  permissions: Permission[];
  members: any[];
  domain: string;
}