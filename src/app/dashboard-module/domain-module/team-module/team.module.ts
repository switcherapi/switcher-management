import { NgModule } from '@angular/core';
import { TeamRoutingModule } from './team.routing';
import { Team } from 'src/app/model/team';


@NgModule({
    imports: [
        TeamRoutingModule
    ],
    providers: [Team]
})
export class TeamModule { }
