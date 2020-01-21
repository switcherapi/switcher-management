import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { DomainRouteService } from '../../services/domain-route.service';
import { PathRoute, Types } from '../model/path-route';
import { ActivatedRoute } from '@angular/router';
import { Domain } from '../model/domain';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { DetailComponent } from '../common/detail-component';
import { AdminService } from '../../services/admin.service';
import { EnvironmentConfigComponent } from '../environment-config/environment-config.component';
import { DomainService } from '../../services/domain.service';
import { ToastService } from 'src/app/_helpers/toast.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-domain-detail',
  templateUrl: './domain-detail.component.html',
  styleUrls: ['./domain-detail.component.css']
})
export class DomainDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @ViewChild('envSelectionChange', { static: true })
  private envSelectionChange: EnvironmentConfigComponent;

  @ViewChild('descElement', { static: true }) 
  private descElement: ElementRef;

  state$: Observable<object>;
  domainDescription: string;
  domainForm: FormGroup;

  constructor(
    private domainRouteService: DomainRouteService,
    private domainService: DomainService,
    private adminService: AdminService,
    private pathRoute: PathRoute,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    super(adminService);
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(map(() => window.history.state)).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data.element) {
          this.updatePathRoute(JSON.parse(data.element));
        } else {
          this.updatePathRoute(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).element);
        }
      });
    
    this.envSelectionChange.outputEnvChanged.pipe(takeUntil(this.unsubscribe)).subscribe(status => {
      this.selectEnvironment(status);
    });

    this.envSelectionChange.outputStatusChanged.pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.updateEnvironmentStatus(env);
    });

    super.loadAdmin(this.getDomain().owner);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  updatePathRoute(domain: Domain) {
    this.pathRoute = {
      id: domain.id,
      element: domain,
      name: domain.name,
      path: '/dashboard/domain/',
      type: Types.DOMAIN_TYPE
    };

    this.domainDescription = domain.description;
    this.domainRouteService.updatePath(this.pathRoute, true);
  }

  updateEnvironmentStatus(env : any): void {
    this.selectEnvironment(env.status);
    this.domainService.setDomainEnvironmentStatus(this.getDomain().id, env.environment, env.status).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.updatePathRoute(data);
        this.toastService.showSucess(`Environment updated with success`);
      }
    }, error => {
      this.toastService.showError(`Unable to update the environment '${env.environment}'`);
    });
  }

  selectEnvironment(status: boolean): void {
    this.currentStatus = status;

    if (this.editing) {
      this.classStatus = 'header editing';
    } else {
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
    }
  }

  getDomain() {
    return this.pathRoute.element;
  }

  edit() {
    this.editing = !this.editing;

    if (this.editing) {
      this.classStatus = 'header editing';
    } else {
      this.domainDescription = this.descElement.nativeElement.value;
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
      this.domainService.updateDomain(this.getDomain().id, this.domainDescription).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.updatePathRoute(data);
          this.toastService.showSucess(`Domain updated with success`);
        }
      }, error => {
        this.toastService.showError(`Unable to update '${this.getDomain().name}' domain`);
      });
    }
  }

}
