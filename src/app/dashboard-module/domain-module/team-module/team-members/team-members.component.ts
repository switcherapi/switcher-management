import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { TeamInviteDialogComponent } from '../team-invite-dialog/team-invite-dialog.component';
import { Team } from 'src/app/model/team';
import { Admin } from 'src/app/model/admin';
import { TeamService } from 'src/app/services/team.service';
import { TeamInvite } from 'src/app/model/team-invite';

@Component({
  selector: 'app-team-members',
  templateUrl: './team-members.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    './team-members.component.css'
  ],
  standalone: false
})
export class TeamMembersComponent implements OnInit, OnDestroy {
  private readonly teamService = inject(TeamService);
  private readonly toastService = inject(ToastService);
  dialog = inject(MatDialog);

  private readonly unsubscribe = new Subject<void>();
  @Input() team: Team;
  @Input() updatable = false;
  @Input() creatable = false;
  @Input() removable = false;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('inputMember', { static: true }) inputMember: ElementRef;

  dataSource: MatTableDataSource<Admin>;
  dataColumns = ['remove', 'name', 'email'];

  loading = false;

  ngOnInit() {
    this.loadTeam();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  inviteMember(email: string) {
    this.teamService.inviteTeamMember(this.team._id, email).pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: invite => {
          if (invite) {
            this.onInvite(invite);
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to invite ${email} - ${error.error}`);
        }
      });
  }

  removeMember(member: Admin) {
    this.teamService.removeTeamMember(this.team._id, member.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: memberRemoved => {
          if (memberRemoved) {
            this.loadTeam();
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to remove ${member.name} - ${error.error}`)
        }
      });
  }

  private loadTeam(): void {
    this.loading = true;
    this.teamService.getTeam(this.team._id).pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: team => {
          if (team) {
            this.loadDataSource(team.members)
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  private loadDataSource(data: Admin[]): void {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
  }

  private onInvite(teamInvite: TeamInvite): void {
    this.inputMember.nativeElement.value = '';
    this.dialog.open(TeamInviteDialogComponent, {
      width: '450px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: {
        request_id: teamInvite._id,
        email: teamInvite.email,
        team: this.team
      }
    });
  }

}