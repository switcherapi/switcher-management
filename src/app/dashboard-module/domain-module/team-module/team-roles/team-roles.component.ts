import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { Team } from '../../model/team';
import { ToastService } from 'src/app/_helpers/toast.service';
import { takeUntil } from 'rxjs/operators';
import { Role } from '../../model/role';
import { RoleService } from 'src/app/dashboard-module/services/role.service';
import { TeamRoleCreateComponent } from '../team-role-create/team-role-create.component';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-team-roles',
  templateUrl: './team-roles.component.html',
  styleUrls: [
    '../../common/css/preview.component.css',
    '../../common/css/detail.component.css',
    './team-roles.component.css'
  ]
})
export class TeamRolesComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  @Input() team: Team;

  @BlockUI() blockUI: NgBlockUI;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  roles: Role[];
  dataSource: MatTableDataSource<Role>;
  dataColumns = ['remove', 'edit', 'router', 'action', 'active'];

  @Input() updatable: boolean = false;
  @Input() creatable: boolean = false;
  @Input() removable: boolean = false;

  loading: boolean = false;

  constructor(
    private roleService: RoleService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadRoles();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getRolesByTeam(this.team._id).pipe(takeUntil(this.unsubscribe)).subscribe(roles => {
      if (roles) {
        this.roles = roles;
        this.loadDataSource(this.roles);
      }
    }, error => {
      ConsoleLogger.printError(error);
      this.loading = false;
    }, () => {
      this.loading = false;
    })
  }

  loadDataSource(data: any): void {
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

  editRole(role: Role) {
    const roleCopy = JSON.parse(JSON.stringify(role));
    const dialogRef = this.dialog.open(TeamRoleCreateComponent, {
      width: '400px',
      data: {
        roles: this.dataSource.data,
        router: roleCopy.router,
        action: roleCopy.action,
        values: roleCopy.values,
        identifiedBy: roleCopy.identifiedBy,
        role: roleCopy
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roleService.updateRole(role._id, result.action, result.router, result.identifiedBy)
          .pipe(takeUntil(this.unsubscribe)).subscribe(role => {
            if (role) {
              this.roleService.updateRoleValues(role._id, result.values).pipe(takeUntil(this.unsubscribe)).subscribe(role => {
                if (role) {
                  this.loadRoles();
                  this.toastService.showSuccess('Role updated with success');
                }
              });
            }
          });
      }
    });
  }

  removeRole(role: Role) {
    this.blockUI.start('Removing role...');
    this.roleService.deleteRole(role._id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.roles.splice(this.roles.indexOf(role), 1);
        this.loadDataSource(this.roles);
        this.blockUI.stop();
        this.toastService.showSuccess('Role removed with success');
      }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
    });
  }

  createRole() {
    const dialogRef = this.dialog.open(TeamRoleCreateComponent, {
      width: '400px',
      data: {
        roles: this.dataSource.data,
        values: []
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roleService.createRole(this.team._id, result.action, result.router, result.identifiedBy, result.values)
          .pipe(takeUntil(this.unsubscribe)).subscribe(role => {
            if (role) {
              this.loadRoles();
              this.toastService.showSuccess('Role created with success');
            }
          });
      }
    });
  }

  updateStatus(role: Role, event: MatSlideToggleChange) {
    this.blockUI.start('Updating status...');
    this.roleService.updateRole(role._id, role.action, role.router, role.identifiedBy, event.checked)
      .pipe(takeUntil(this.unsubscribe)).subscribe(role => {
        if (role) {
          this.toastService.showSuccess('Role updated with success');
        }
      }, error => {
        this.toastService.showError('Permission denied');
        ConsoleLogger.printError(error);
        this.blockUI.stop();
      }, () => {
        this.blockUI.stop();
      });
  }

  formatContent(value: string): string {
    if (window.screen.width < 380)
      return value.substring(0, 3);
    else
      return value;
  }

  sortData(sort: Sort) {
    let sortedData;

    const data = this.roles.slice();
    if (!sort.active || sort.direction === '') {
      sortedData = data;
      return;
    }

    sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'router': return this.compare(a.router, b.router, isAsc);
        case 'action': return this.compare(a.action, b.action, isAsc);
        case 'active': return this.compare(a.active ? 'true' : 'false', b.active ? 'true' : 'false', isAsc);
        default: return 0;
      }
    });

    this.loadDataSource(sortedData);
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}
