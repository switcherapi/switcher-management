import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { EnvironmentService } from 'src/app/services/environment.service';
import { ActivatedRoute } from '@angular/router';
import { DomainRouteService } from 'src/app/services/domain-route.service';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: [
    '../../common/css/list.component.css', 
    './group-list.component.css'
  ]
})
export class GroupListComponent extends ListComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  
  groups: Group[];
  loading = false;
  error = '';

  creatable: boolean = false;

  constructor(
    protected fb: FormBuilder,
    protected route: ActivatedRoute,
    protected environmentService: EnvironmentService,
    private domainRouteService: DomainRouteService,
    private dialog: MatDialog,
    private adminService: AdminService,
    private groupService: GroupService,
    private toastService: ToastService,
    private errorHandler: RouterErrorHandler
  ) {
    super(route, fb, environmentService);
  }

  ngOnInit() {
    this.cardListContainerStyle = 'card mt-4 loading';
    this.loading = true;
    this.error = '';

    this.readPermissionToObject();
    this.loadGroups();
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
        this.loading = true;
        this.groupService.createGroup(this.domainId, result.name, result.description)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(data => {
            if (data) {
              this.ngOnInit();
            }
        }, error => {
          this.ngOnInit();
          this.toastService.showError(`Unable to create a new group. ${error.error}`);
          ConsoleLogger.printError(error);
        });
      }
    });
  }

  private loadGroups() {
    this.groupService.getGroupsByDomain(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.groups = data;
          super.loadEnvironments();
          this.domainRouteService.updateView(decodeURIComponent(this.domainName), 0);
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

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['CREATE'], 'GROUP', 'name', this.domainName)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          data.forEach(element => {
            if (element.action === 'CREATE') {
              this.creatable = element.result === 'ok';
            }
          });
        }
    });
  }

}
