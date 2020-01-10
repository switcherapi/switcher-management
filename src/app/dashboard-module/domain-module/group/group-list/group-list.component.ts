import { Component, OnInit, OnDestroy } from '@angular/core';
import { Group } from '../../model/group';
import { DomainRouteService } from '../../../services/domain-route.service';
import { Types } from '../../model/path-route';
import { environment } from 'src/environments/environment';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GroupService } from 'src/app/dashboard-module/services/group.service';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  groups$: Group[];
  loading = false;
  error = '';

  constructor(
    private groupService: GroupService,
    private domainRouteService : DomainRouteService,
    private errorHandler: RouterErrorHandler
  ) { }

  ngOnInit() {
    this.loading = true;
    this.error = '';
    this.groupService.getGroupsByDomain(
      this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {

      if (data) {
        this.groups$ = data;
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

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
