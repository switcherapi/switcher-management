import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { DetailComponent } from '../common/detail-component';
import { EnvironmentConfigComponent } from '../environment-config/environment-config.component';
import { ToastService } from 'src/app/_helpers/toast.service';
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirm } from 'src/app/_helpers/confirmation-dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { DomainService } from 'src/app/services/domain.service';
import { AdminService } from 'src/app/services/admin.service';
import { PathRoute, Types } from 'src/app/model/path-route';
import { Domain } from 'src/app/model/domain';

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

  collabUser: boolean = false;

  constructor(
    private domainRouteService: DomainRouteService,
    private domainService: DomainService,
    private adminService: AdminService,
    private pathRoute: PathRoute,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private _modalService: NgbModal
  ) {
    super(adminService);
  }

  ngOnInit() {
    this.loading = true;
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
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  leaveDomain() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirm);
    modalConfirmation.componentInstance.title = 'Quit domain';
    modalConfirmation.componentInstance.question = 'Are you sure you want to leave this domain?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.blockUI.start('Leaving...');
        this.adminService.leaveDomain(this.getDomain().id).pipe(takeUntil(this.unsubscribe)).subscribe(admin => {
          this.blockUI.stop();
          if (admin) {
            this.toastService.showSuccess(`Left with success`);
          }
        }, error => {
          this.blockUI.stop();
          this.toastService.showError(`Unable to leave this domain`);
          ConsoleLogger.printError(error);
        }, () => {
          this.router.navigate(['/dashboard']);
        });
      }
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
      this.blockUI.start('Saving changes...');
      this.domainDescription = this.descElement.nativeElement.value;

      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
      if (super.validateEdition(
          { description: this.pathRoute.element.description }, 
          { description: this.domainDescription})) {
        this.blockUI.stop();
        this.editing = false;
        return;
      }

      this.domainService.updateDomain(this.getDomain().id, this.domainDescription).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.updatePathRoute(data);
          this.domainRouteService.notifyDocumentChange();
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

  delete() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirm);
    modalConfirmation.componentInstance.title = 'Domain removal';
    modalConfirmation.componentInstance.question = 'Are you sure you want to remove this domain?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.blockUI.start('Removing domain...');
        this.domainService.deleteDomain(this.getDomain().id).pipe(takeUntil(this.unsubscribe)).subscribe(_data => {
          this.blockUI.stop();
          this.domainRouteService.removePath(Types.GROUP_TYPE);
          this.domainRouteService.notifyDocumentChange();
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

  private updatePathRoute(domain: Domain) {
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
    this.checkDomainOwner();

    super.loadAdmin(this.getDomain().owner);
  }

  private updateEnvironmentStatus(env : any): void {
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

  private removeEnvironmentStatus(env : any): void {
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

  private checkDomainOwner(): void {
    this.adminService.getAdmin().pipe(takeUntil(this.unsubscribe)).subscribe(currentUser => {
      if (currentUser) {
        this.collabUser = currentUser.id != this.getDomain().owner;
      }
    });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.getDomain().id, ['UPDATE', 'DELETE'], 'DOMAIN', 'name', this.getDomain().name)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'UPDATE') {
            this.updatable = element.result === 'ok';
            this.envSelectionChange.disableEnvChange(!this.updatable);
          } else if (element.action === 'DELETE') {
            this.removable = element.result === 'ok';
          }
        });
      }
    }, error => {
      ConsoleLogger.printError(error);
    }, () => {
      this.blockUI.stop();
      this.loading = false;
      this.detailBodyStyle = 'detail-body ready';
    });
  }
}
