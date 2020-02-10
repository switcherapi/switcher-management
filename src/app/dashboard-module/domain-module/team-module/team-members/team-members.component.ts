import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { Team } from '../../model/team';
import { TeamService } from 'src/app/dashboard-module/services/team.service';
import { takeUntil } from 'rxjs/operators';
import { Admin } from '../../model/admin';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';

@Component({
  selector: 'app-team-members',
  templateUrl: './team-members.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    './team-members.component.css']
})
export class TeamMembersComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  @Input() team: Team;
  @Input() updatable: boolean = true;
  @Input() creatable: boolean = true;
  @Input() removable: boolean = true;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  dataSource: MatTableDataSource<Admin>;
  dataColumns = ['remove', 'name', 'email'];

  constructor(
    private teamService: TeamService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadTeam();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadTeam(): void {
    this.teamService.getTeam(this.team._id).pipe(takeUntil(this.unsubscribe)).subscribe(team => {
      if (team) {
        this.loadDataSource(team.members)
      }
    }, error => {
      ConsoleLogger.printError(error);
    })
  }

  loadDataSource(data: Admin[]): void {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  inviteMember(email: string) {
    this.teamService.inviteTeamMember(this.team._id, email).pipe(takeUntil(this.unsubscribe)).subscribe(member => {
      if (member) {
        this.loadTeam();
        this.toastService.showSuccess('User invited with success');
      }
    }, error => {
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to invite ${email} - ${error.error}`)
    })
  }

  removeMember(member: Admin) {
    this.teamService.removeTeamMember(this.team._id, member.id).pipe(takeUntil(this.unsubscribe)).subscribe(member => {
      if (member) {
        this.loadTeam();
      }
    }, error => {
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to remove ${member.name} - ${error.error}`)
    })
  }

}
