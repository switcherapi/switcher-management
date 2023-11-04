import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { TeamInviteDialogComponent } from '../team-invite-dialog/team-invite-dialog.component';
import { Team } from 'src/app/model/team';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-pending-members',
  templateUrl: './team-pending-members.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    './team-pending-members.component.css']
})
export class TeamPendingMembersComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  @Input() team: Team;
  @Input() updatable: boolean = false;
  @Input() creatable: boolean = false;
  @Input() removable: boolean = false;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: MatTableDataSource<any>;
  dataColumns = ['remove', 'email', 'createdAt', 'request'];

  loading: boolean = false;

  constructor(
    private teamService: TeamService,
    private toastService: ToastService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadPendingInvitations();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  removeInvitation(request: string) {
    this.teamService.removeInvitation(this.team._id, request).pipe(takeUntil(this.unsubscribe)).subscribe(invitationRequest => {
      if (invitationRequest) {
        this.loadPendingInvitations();
      }
    }, error => {
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to remove invitaion request - ${error.error}`)
    })
  }

  onGetInviteRequest(invite: any): void {
    this.dialog.open(TeamInviteDialogComponent, {
      width: '450px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: {
        request_id: invite._id,
        email: invite.email,
        team: this.team
      }
    });
  }

  private loadPendingInvitations(): void {
    this.loading = true;
    this.teamService.getPendingInvitations(this.team._id).pipe(takeUntil(this.unsubscribe)).subscribe(invitations => {
      this.loadDataSource(invitations);
    }, error => {
      ConsoleLogger.printError(error);
      this.loading = false;
    }, () => {
      this.loading = false;
    })
  }

  private loadDataSource(data: any[]): void {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
  }

}