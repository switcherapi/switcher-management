import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastService } from 'src/app/_helpers/toast.service';
import { takeUntil } from 'rxjs/operators';
import { TeamPermissionCreateComponent } from '../team-permission-create/team-permission-create.component';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Team } from 'src/app/model/team';
import { Permission } from 'src/app/model/permission';
import { PermissionService } from 'src/app/services/permission.service';
import { BasicComponent } from '../../common/basic-component';

@Component({
  selector: 'app-team-permissions',
  templateUrl: './team-permissions.component.html',
  styleUrls: [
    '../../common/css/preview.component.css',
    '../../common/css/detail.component.css',
    './team-permissions.component.css'
  ],
  standalone: false
})
export class TeamPermissionsComponent extends BasicComponent implements OnInit, OnDestroy {
  private readonly unsubscribe = new Subject<void>();
  @Input() team: Team;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  permissions: Permission[];
  dataSource: MatTableDataSource<Permission>;
  dataColumns = ['remove', 'edit', 'router', 'action', 'environments', 'active'];

  @Input() updatable = false;
  @Input() creatable = false;
  @Input() removable = false;

  loading = false;

  constructor(
    private readonly permissionService: PermissionService,
    private readonly toastService: ToastService,
    private readonly dialog: MatDialog
  ) {
    super();
  }

  ngOnInit() {
    this.loadPermissions();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editPermission(permission: Permission) {
    const permissionCopy = JSON.parse(JSON.stringify(permission));
    const dialogRef = this.dialog.open(TeamPermissionCreateComponent, {
      width: '400px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: {
        domain: this.team.domain,
        permissions: this.dataSource.data,
        router: permissionCopy.router,
        action: permissionCopy.action,
        environments: permissionCopy.environments,
        values: permissionCopy.values,
        identifiedBy: permissionCopy.identifiedBy,
        permission: permissionCopy
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.permissionService.updatePermission(permission._id, result.action, result.router, result.identifiedBy, result.environments, result.values)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: permission => {
              if (permission) {
                this.loadPermissions();
                this.toastService.showSuccess('Permission updated with success');
              }
            },
            error: error => {
              this.toastService.showError('Permission denied');
              ConsoleLogger.printError(error);
              this.setBlockUI(false);
            },
            complete: () => {
              this.setBlockUI(false);
            }
          });
      }
    });
  }

  removePermission(permission: Permission) {
    this.setBlockUI(true, 'Removing permission...');
    this.permissionService.deletePermission(permission._id).pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.permissions.splice(this.permissions.indexOf(permission), 1);
            this.loadDataSource(this.permissions);
            this.setBlockUI(false);
            this.toastService.showSuccess('Permission removed with success');
          }
        },
        error: error => {
          this.setBlockUI(false);
          ConsoleLogger.printError(error);
        }
      });
  }

  createPermission() {
    const dialogRef = this.dialog.open(TeamPermissionCreateComponent, {
      width: '400px',
      data: {
        permissions: this.dataSource.data,
        domain: this.team.domain,
        values: []
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.permissionService.createPermission(this.team._id, result.action, result.router, result.environments, result.identifiedBy, result.values)
          .pipe(takeUntil(this.unsubscribe)).subscribe(permission => {
            if (permission) {
              this.loadPermissions();
              this.toastService.showSuccess('Permission created with success');
            }
          });
      }
    });
  }

  updateStatus(permission: Permission, event: MatSlideToggleChange) {
    this.setBlockUI(true, 'Updating status...');
    this.permissionService.updatePermissionStatus(permission._id, event.checked)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: permissionUpdated => {
          if (permissionUpdated) {
            this.toastService.showSuccess('Permission updated with success');
          }
        },
        error: error => {
          this.toastService.showError('Permission denied');
          ConsoleLogger.printError(error);
          this.setBlockUI(false);
        },
        complete: () => {
          this.setBlockUI(false);
        }
      });
  }

  formatContent(value: string): string {
    if (window.screen.width < 560)
      return value.substring(0, 3);
    else
      return value;
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    
    const data = this.permissions.slice();
    const sortedData = [...data].sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'router': return this.compare(a.router, b.router, isAsc);
        case 'action': return this.compare(a.action, b.action, isAsc);
        case 'environments': return this.compare(a.environments.join(', '), b.environments.join(', '), isAsc);
        case 'active': return this.compare(a.active ? 'true' : 'false', b.active ? 'true' : 'false', isAsc);
        default: return 0;
      }
    });

    this.loadDataSource(sortedData);
  }

  private loadPermissions(): void {
    this.loading = true;
    this.permissionService.getPermissionsByTeam(this.team._id).pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: permissions => {
          if (permissions) {
            this.permissions = permissions;
            this.loadDataSource(this.permissions);
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

  private loadDataSource(data: Permission[]): void {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}
