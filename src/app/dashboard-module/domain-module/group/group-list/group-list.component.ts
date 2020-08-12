import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';
import { ListComponent } from '../../common/list-component';
import { GroupCreateComponent } from '../group-create/group-create.component';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { MatDialog } from '@angular/material/dialog';
import { Group } from 'src/app/model/group';
import { AdminService } from 'src/app/services/admin.service';
import { GroupService } from 'src/app/services/group.service';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { EnvironmentService } from 'src/app/services/environment.service';
import { Types } from 'src/app/model/path-route';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: [
    '../../common/css/list.component.css', 
    './group-list.component.css'
  ]
})
export class GroupListComponent extends ListComponent implements OnInit, OnDestroy, AfterViewInit {
  private unsubscribe: Subject<void> = new Subject();
  
  groups: Group[];
  loading = false;
  error = '';

  creatable: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private adminService: AdminService,
    private groupService: GroupService,
    private domainRouteService : DomainRouteService,
    private environmentService: EnvironmentService,
    private toastService: ToastService,
    private errorHandler: RouterErrorHandler
  ) {
    super(fb, environmentService, domainRouteService);
  }

  ngOnInit() {
    this.cardListContainerStyle = 'card mt-4 loading';
    this.loading = true;
    this.error = '';
    this.readPermissionToObject();
    this.groupService.getGroupsByDomain(
      this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.groups = data;
        super.loadEnvironments();
      }
    }, error => {
      ConsoleLogger.printError(error);
      this.loading = false;
      this.error = this.errorHandler.doError(error);
    }, () => {
      if (!this.groups) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loading = false;
    });
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  createGroup(): void {
    const dialogRef = this.dialog.open(GroupCreateComponent, {
      width: '400px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: { name: '',  description: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.groupService.createGroup(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id, result.name, result.description)
          .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          if (data) {
            this.ngOnInit();
          }
        }, error => {
          this.toastService.showError('Unable to create a new group.');
          ConsoleLogger.printError(error);
        });
      }
    });
  }

  readPermissionToObject(): void {
    const domain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
    this.adminService.readCollabPermission(domain.id, ['CREATE'], 'GROUP', 'name', domain.name)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'CREATE') {
            this.creatable = element.result === 'ok' ? true : false;
          }
        });
      }
    });
  }

}
