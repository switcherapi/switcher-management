import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { TeamInviteDialog } from '../team-invite-dialog/team-invite-dialog.component';
import { Team } from 'src/app/model/team';
import { Admin } from 'src/app/model/admin';
import { TeamService } from 'src/app/services/team.service';
import { TeamInvite } from 'src/app/model/team-invite';

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
  @Input() updatable: boolean = false;
  @Input() creatable: boolean = false;
  @Input() removable: boolean = false;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('inputMember', { static: true }) inputMember: ElementRef;

  dataSource: MatTableDataSource<Admin>;
  dataColumns = ['remove', 'name', 'email'];

  loading: boolean = false;

  constructor(
    private teamService: TeamService,
    private toastService: ToastService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadTeam();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadTeam(): void {
    this.loading = true;
    this.teamService.getTeam(this.team._id).pipe(takeUntil(this.unsubscribe)).subscribe(team => {
      if (team) {
        this.loadDataSource(team.members)
      }
    }, error => {
      ConsoleLogger.printError(error);
      this.loading = false;
    }, () => {
      this.loading = false;
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
    this.teamService.inviteTeamMember(this.team._id, email).pipe(takeUntil(this.unsubscribe)).subscribe(invite => {
      if (invite) {
        this.onInvite(invite);
      }
    }, error => {
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to invite ${email} - ${error.error}`);
    });
  }

  onInvite(teamInvite: TeamInvite): void {
    this.inputMember.nativeElement.value = '';
    this.dialog.open(TeamInviteDialog, {
      width: '450px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: {
        request_id: teamInvite._id,
        email: teamInvite.email,
        team: this.team
      }
    });
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