import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { DomainRouteService } from '../../services/domain-route.service';
import { PathRoute, Types } from '../model/path-route';
import { ActivatedRoute, Router } from '@angular/router';
import { Domain } from '../model/domain';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { DetailComponent } from '../common/detail-component';
import { AdminService } from '../../services/admin.service';
import { EnvironmentConfigComponent } from '../environment-config/environment-config.component';
import { DomainService } from '../../services/domain.service';
import { ToastService } from 'src/app/_helpers/toast.service';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { DomainCreateComponent } from '../../domain-create/domain-create.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirm } from 'src/app/_helpers/confirmation-dialog';

@Component({
  selector: 'app-domain-detail',
  templateUrl: './domain-detail.component.html',
  styleUrls: [
    '../common/css/detail.component.css', 
    './domain-detail.component.css'
  ]
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
    private router: Router,
    private toastService: ToastService,
    private dialog: MatDialog,
    private _modalService: NgbModal
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

    this.envSelectionChange.outputEnvRemoved.pipe(takeUntil(this.unsubscribe)).subscribe(env => {
      this.removeEnvironmentStatus(env);
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
        this.toastService.showSuccess(`Environment updated with success`);
      }
    }, error => {
      this.toastService.showError(`Unable to update the environment '${env.environment}'`);
    });
  }

  removeEnvironmentStatus(env : any): void {
    this.domainService.removeDomainEnvironmentStatus(this.getDomain().id, env).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.updatePathRoute(data);
        this.toastService.showSuccess(`Environment removed with success`);
      }
    }, error => {
      console.log(error);
      this.toastService.showError(`Unable to remove the environment '${env}'`);
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
    if (!this.editing) {
      this.classStatus = 'header editing';
      this.editing = true;
    } else {
      this.domainDescription = this.descElement.nativeElement.value;
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
      this.domainService.updateDomain(this.getDomain().id, this.domainDescription).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.updatePathRoute(data);
          this.toastService.showSuccess(`Domain updated with success`);
          this.editing = false;
        }
      }, error => {
        this.toastService.showError(`Unable to update '${this.getDomain().name}' domain`);
        this.editing = false;
      });
    }
  }

  generateApiKey() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirm);
    modalConfirmation.componentInstance.title = 'API Key';
    modalConfirmation.componentInstance.question = 'Are you sure you want to generate a new key for this domain?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.domainService.generateApiKey(this.getDomain().id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          if (data) {
            this.dialog.open(DomainCreateComponent, {
              width: '400px',
              data: { apiKey: data.apiKey, domainName: this.getDomain().name }
            });
          }
        }, error => {
          this.toastService.showError(`Unable to generate an API Key`);
          console.log(error);
        });
      }
    })
  }

  delete() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirm);
    modalConfirmation.componentInstance.title = 'Domain removal';
    modalConfirmation.componentInstance.question = 'Are you sure you want to remove this domain?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.domainService.deleteDomain(this.getDomain().id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          this.domainRouteService.removePath(Types.GROUP_TYPE);
          this.router.navigate(['/dashboard/']);
          this.toastService.showSuccess(`Domain removed with success`);
        }, error => {
          this.toastService.showError(`Unable to remove this domain`);
          console.log(error);
        });
      }
    });
  }
}
