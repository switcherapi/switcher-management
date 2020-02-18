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
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

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

  @BlockUI() blockUI: NgBlockUI;

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
    this.blockUI.start('Loading...');
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
    this.readPermissionToObject();
  }

  updateEnvironmentStatus(env : any): void {
    this.blockUI.start('Updating environment...');
    this.domainService.setDomainEnvironmentStatus(this.getDomain().id, env.environment, env.status).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.selectEnvironment(env.status);
        this.updatePathRoute(data);
        this.blockUI.stop();
        this.toastService.showSuccess(`Environment updated with success`);
      }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to update the environment '${env.environment}'`);
    });
  }

  removeEnvironmentStatus(env : any): void {
    this.blockUI.start('Removing environment status...');
    this.domainService.removeDomainEnvironmentStatus(this.getDomain().id, env).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.blockUI.stop();
        this.updatePathRoute(data);
        this.toastService.showSuccess(`Environment removed with success`);
      }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
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

  readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.getDomain().id, ['UPDATE', 'DELETE'], 'DOMAIN', 'name', this.getDomain().name)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'UPDATE') {
            this.updatable = element.result === 'ok' ? true : false;
            this.envSelectionChange.disableEnvChange(!this.updatable);
          } else if (element.action === 'DELETE') {
            this.removable = element.result === 'ok' ? true : false;
          }
        });
      }
    }, error => {
      ConsoleLogger.printError(error);
    }, () => {
      this.blockUI.stop();
      this.detailBodyStyle = 'detail-body ready';
    });
  }

  edit() {
    if (!this.editing) {
      this.classStatus = 'header editing';
      this.editing = true;
    } else {
      this.blockUI.start('Saving changes...');
      this.domainDescription = this.descElement.nativeElement.value;
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
      this.domainService.updateDomain(this.getDomain().id, this.domainDescription).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.updatePathRoute(data);
          this.blockUI.stop();
          this.toastService.showSuccess(`Domain updated with success`);
          this.editing = false;
        }
      }, error => {
        this.blockUI.stop();
        ConsoleLogger.printError(error);
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
        this.blockUI.start('Generating API Key...');
        this.domainService.generateApiKey(this.getDomain().id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          if (data) {
            this.blockUI.stop();
            this.dialog.open(DomainCreateComponent, {
              width: '400px',
              data: { apiKey: data.apiKey, domainName: this.getDomain().name }
            });
          }
        }, error => {
          this.blockUI.stop();
          this.toastService.showError(`Unable to generate an API Key`);
          ConsoleLogger.printError(error);
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
        this.blockUI.start('Removing domain...');
        this.domainService.deleteDomain(this.getDomain().id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          this.blockUI.stop();
          this.domainRouteService.removePath(Types.GROUP_TYPE);
          this.router.navigate(['/dashboard/']);
          this.toastService.showSuccess(`Domain removed with success`);
        }, error => {
          this.blockUI.stop();
          this.toastService.showError(`Unable to remove this domain`);
          ConsoleLogger.printError(error);
        });
      }
    });
  }
}
