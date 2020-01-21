import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Group } from '../../model/group';
import { DomainRouteService } from '../../../services/domain-route.service';
import { Types } from '../../model/path-route';
import { environment } from 'src/environments/environment';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GroupService } from 'src/app/dashboard-module/services/group.service';
import { EnvironmentService } from 'src/app/dashboard-module/services/environment.service';
import { FormBuilder } from '@angular/forms';
import { ListComponent } from '../../common/list-component';

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
  
  groups$: Group[];
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private groupService: GroupService,
    private domainRouteService : DomainRouteService,
    private environmentService: EnvironmentService,
    private errorHandler: RouterErrorHandler
  ) {
    super(fb, environmentService, domainRouteService);
  }

  ngOnInit() {
    this.loading = true;
    this.error = '';
    this.groupService.getGroupsByDomain(
      this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {

      if (data) {
        this.groups$ = data;
        super.loadEnvironments();
      }
      this.loading = false;
    }, error => {
      this.error = this.errorHandler.doError(error);
      this.loading = false;
    });

    setTimeout(() => {
      if (!this.groups$) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loading = false;
    }, environment.timeout);
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
