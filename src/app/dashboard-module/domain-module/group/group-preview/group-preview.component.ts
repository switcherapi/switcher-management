import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { Group } from '../../model/group';
import { Router } from '@angular/router';
import { GroupListComponent } from '../group-list/group-list.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material';
import { GroupService } from 'src/app/dashboard-module/services/group.service';
import { DomainRouteService } from 'src/app/dashboard-module/services/domain-route.service';
import { Types } from '../../model/path-route';
import { ToastService } from 'src/app/_helpers/toast.service';
import { AdminService } from 'src/app/dashboard-module/services/admin.service';

@Component({
  selector: 'app-group-preview',
  templateUrl: './group-preview.component.html',
  styleUrls: [
    '../../common/css/preview.component.css', 
    './group-preview.component.css'
  ]
})
export class GroupPreviewComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  
  @Input() group: Group;
  @Input() groupListComponent: GroupListComponent;

  environmentStatusSelection: FormGroup;
  selectedEnvStatus: boolean;
  selectedEnv: string;

  classStatus: string;
  classBtnStatus: string;

  updatable: boolean = true;
  removable: boolean = true;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private adminService: AdminService,
    private domainRouteService: DomainRouteService,
    private groupService: GroupService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadOperationSelectionComponent();
    this.groupListComponent.environmentSelectionChange.pipe(takeUntil(this.unsubscribe)).subscribe(envName => {
      this.selectEnvironment(envName);
    });

    this.readPermissionToObject();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadOperationSelectionComponent(): void {
    this.environmentStatusSelection = this.fb.group({
      environmentStatusSelection: [null, Validators.required]
    });
  }

  getGroupName() {
    return this.group.name;
  }

  getGroup() {
    return this.group;
  }

  updatePathRoute(group: Group) {
    const pathRoute = {
      id: group.id,
      element: group,
      name: group.name,
      path: '/dashboard/domain/group/detail',
      type: Types.GROUP_TYPE
    };

    this.domainRouteService.updatePath(pathRoute, false);
    this.readPermissionToObject();
  }

  selectGroup() {
    this.router.navigate(['/dashboard/domain/group/detail'], { state: { element: JSON.stringify(this.group) } });
  }

  selectEnvironment(envName: string): void {
    this.selectedEnv = envName;
    const status = this.group.activated[envName] == undefined ? this.group.activated['default'] : this.group.activated[envName];

    this.classStatus = status ? 'grid-container activated' : 'grid-container deactivated';
    this.classBtnStatus = status ? 'btn-element activated' : 'btn-element deactivated';

    this.environmentStatusSelection.get('environmentStatusSelection').setValue(status);
    this.selectedEnvStatus = status;
  }

  updateEnvironmentStatus(event: MatSlideToggleChange) {
    this.group.activated[this.selectedEnv] = event.checked;
    this.selectEnvironment(this.selectedEnv);

    this.groupService.setGroupEnvironmentStatus(this.getGroup().id, this.selectedEnv, event.checked).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.updatePathRoute(data);
        this.toastService.showSuccess(`Environment updated with success`);
      }
    }, error => {
      this.toastService.showError(`Unable to update the environment '${this.selectedEnv}'`);
    });
  }

  readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id, 
      ['UPDATE', 'DELETE'], 'GROUP', 'name', this.getGroup().name)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'UPDATE') {
            this.updatable = element.result === 'ok' ? true : false;
            
            if (!this.updatable)
              this.environmentStatusSelection.disable({ onlySelf: true });
          } else if (element.action === 'DELETE') {
            this.removable = element.result === 'ok' ? true : false;
          }
        });
      }
    });
  }

}
