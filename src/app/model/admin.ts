import { Team } from './team';

export class Admin {
    id: string;
    active: boolean;
    name: string;
    email: string;
    teams: Team[] | any;
}