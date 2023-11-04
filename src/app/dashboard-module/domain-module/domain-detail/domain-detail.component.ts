import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { DetailComponent } from '../common/detail-component';
import { ToastService } from 'src/app/_helpers/toast.service';
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { DomainService } from 'src/app/services/domain.service';
import { AdminService } from 'src/app/services/admin.service';
import { Domain } from 'src/app/model/domain';
import { Types } from 'src/app/model/path-route';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { EnvironmentChangeEvent } from '../environment-config/environment-config.component';
import { AuthService } from 'src/app/auth/services/auth.service';

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

  @ViewChild('descElement', { static: true }) 
  private descElement: ElementRef;

  envEnable = new Subject<boolean>();

  domain: Domain;
  domainId: string;
  domainForm: FormGroup;

  collabUser: boolean = false;

  constructor(
    private domainRouteService: DomainRouteService,
    private domainService: DomainService,
    private adminService: AdminService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private _modalService: NgbModal
  ) {
    super();
    this.route.params.subscribe(params => this.domainId = params.domainid);
  }

  ngOnInit() {
    this.loading = true;
    this.route.paramMap
      .pipe(map(() => window.history.state)).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data.element) {
          this.updateData(JSON.parse(data.element));
        } else {
          this.loadDomain();
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  leaveDomain() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Quit domain';
    modalConfirmation.componentInstance.question = 'Are you sure you want to leave this domain?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.blockUI.start('Leaving...');
        this.adminService.leaveDomain(this.domain.id).pipe(takeUntil(this.unsubscribe)).subscribe(admin => {
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

  edit() {
    if (!this.editing) {
      this.classStatus = 'header editing';
      this.editing = true;
    } else {
      this.blockUI.start('Saving changes...');
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';

      const newDescription = this.descElement.nativeElement.value;
      if (super.validateEdition(
          { description: this.domain.description }, 
          { description: newDescription})) {
        this.blockUI.stop();
        this.editing = false;
        return;
      }

      this.editDomain(newDescription);
    }
  }

  delete() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Domain removal';
    modalConfirmation.componentInstance.question = 'Are you sure you want to remove this domain?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.blockUI.start('Removing domain...');
        this.domainService.deleteDomain(this.domain.id).pipe(takeUntil(this.unsubscribe)).subscribe(_data => {
          this.blockUI.stop();
          this.router.navigate(['/dashboard']);
          this.toastService.showSuccess(`Domain removed with success`);
        }, error => {
          this.blockUI.stop();
          this.toastService.showError(`Unable to remove this domain`);
          ConsoleLogger.printError(error);
        });
      }
    });
  }

  onEnvChange($event: EnvironmentChangeEvent) {
    this.selectEnvironment($event);

    if ($event.reloadPermissions) {
      this.readPermissionToObject();
    }
  }

  private loadDomain() {
    this.domainService.getDomain(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(domain => {
        if (domain) {
          this.updateData(domain);
        }
    }, error => {
      this.toastService.showError(`Unable to load Domain`);
      ConsoleLogger.printError(error);
    });
  }

  private updateData(domain: Domain) {
    this.domain = domain;
    this.readPermissionToObject();
    this.checkDomainOwner();
    
    this.domainRouteService.updateView(this.domain.name, 0);
    this.domainRouteService.updatePath(this.domain.id, this.domain.name, Types.DOMAIN_TYPE, 
      `/dashboard/domain/${encodeURIComponent(this.domain.name)}/${this.domainId}`);
  }

  private editDomain(newDescription: string) {
    this.domainService.updateDomain(this.domain.id, newDescription).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.domain.description = newDescription;
        
        this.blockUI.stop();
        this.toastService.showSuccess(`Domain updated with success`);
        this.editing = false;
      }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to update '${this.domain.name}' domain`);
      this.editing = false;
    });
  }

  public updateEnvironmentStatus(env: EnvironmentChangeEvent): void {
    this.blockUI.start('Updating environment...');
    this.domainService.setDomainEnvironmentStatus(this.domain.id, env.environmentName, env.status)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.selectEnvironment(env);
          this.blockUI.stop();
          this.toastService.showSuccess(`Environment updated with success`);
        }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to update the environment '${env.environmentName}'`);
    });
  }

  public removeEnvironmentStatus(env: any): void {
    this.blockUI.start('Removing environment status...');
    this.domainService.removeDomainEnvironmentStatus(this.domain.id, env)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data) {
          this.blockUI.stop();
          this.toastService.showSuccess(`Environment removed with success`);
        }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to remove the environment '${env}'`);
    });
  }

  private checkDomainOwner(): void {
    const currentUserId = this.authService.getUserInfo('sessionid');
    this.collabUser = currentUserId != this.domain.owner;
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domain.id, ['UPDATE', 'UPDATE_ENV_STATUS', 'DELETE'], 
      'DOMAIN', undefined, undefined, this.currentEnvironment)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          this.updatable = data.find(permission => permission.action === 'UPDATE').result === 'ok';
          this.removable = data.find(permission => permission.action === 'DELETE').result === 'ok';
          this.envEnable.next(
            data.find(permission => permission.action === 'UPDATE_ENV_STATUS').result === 'nok' &&
            data.find(permission => permission.action === 'UPDATE').result === 'nok'
          );
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
