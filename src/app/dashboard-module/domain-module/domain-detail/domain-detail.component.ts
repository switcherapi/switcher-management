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
  ],
  standalone: false
})
export class DomainDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private readonly unsubscribe = new Subject<void>();

  @ViewChild('descElement', { static: true }) 
  private readonly descElement: ElementRef;

  envEnable = new Subject<boolean>();

  domain: Domain;
  domainId: string;
  domainForm: FormGroup;

  collabUser = false;

  constructor(
    private readonly domainRouteService: DomainRouteService,
    private readonly domainService: DomainService,
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastService: ToastService,
    private readonly _modalService: NgbModal
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
        this.setBlockUI(true, 'Leaving domain...');
        this.adminService.leaveDomain(this.domain.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: admin => {
              this.setBlockUI(false);
              if (admin) {
                this.toastService.showSuccess(`Left with success`);
              }
            },
            error: error => {
              this.setBlockUI(false);
              this.toastService.showError(`Unable to leave this domain`);
              ConsoleLogger.printError(error);
            },
            complete: () => {
              this.router.navigate(['/dashboard']);
            }
          });
      }
    });
  }

  edit() {
    if (!this.editing) {
      this.classStatus = 'header editing';
      this.editing = true;
    } else {
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';

      const newDescription = this.descElement.nativeElement.value;
      if (super.validateEdition(
          { description: this.domain.description }, 
          { description: newDescription})) {
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
        this.setBlockUI(true, 'Removing domain...');
        this.domainService.deleteDomain(this.domain.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: () => {
              this.setBlockUI(false);
              this.router.navigate(['/dashboard']);
              this.toastService.showSuccess(`Domain removed with success`);
            },
            error: error => {
              this.setBlockUI(false);
              this.toastService.showError(`Unable to remove this domain`);
              ConsoleLogger.printError(error);
            }
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
      .subscribe({
        next: domain => {
          if (domain) {
            this.updateData(domain);
          }
        },
        error: error => {
          this.toastService.showError(`Unable to load Domain`);
          ConsoleLogger.printError(error);
        }
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
    this.setBlockUI(true, 'Saving changes...');

    this.domainService.updateDomain(this.domain.id, newDescription)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.domain.description = newDescription;
            this.setBlockUI(false);
            this.toastService.showSuccess(`Domain updated with success`);
            this.editing = false;
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.setBlockUI(false);
          this.toastService.showError(`Unable to update '${this.domain.name}' domain`);
          this.editing = false;
        }
      });
  }

  public updateEnvironmentStatus(env: EnvironmentChangeEvent): void {
    this.setBlockUI(true, 'Updating environment...');
    this.domainService.setDomainEnvironmentStatus(this.domain.id, env.environmentName, env.status)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.selectEnvironment(env);
            this.setBlockUI(false);
            this.toastService.showSuccess(`Environment updated with success`);
          }
        },
        error: error => {
          this.setBlockUI(false);
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to update the environment '${env.environmentName}'`);
        }
      });
  }

  public removeEnvironmentStatus(env: any): void {
    this.setBlockUI(true, 'Removing environment status...');
    this.domainService.removeDomainEnvironmentStatus(this.domain.id, env)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.setBlockUI(false);
            this.toastService.showSuccess(`Environment removed with success`);
          }
        },
        error: error => {
          this.setBlockUI(false);
          ConsoleLogger.printError(error);
          this.toastService.showError(`Unable to remove the environment '${env}'`);
        }
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
      .subscribe({
        next: data => {
          if (data.length) {
            this.updatable = data.find(permission => permission.action === 'UPDATE').result === 'ok';
            this.removable = data.find(permission => permission.action === 'DELETE').result === 'ok';
            this.envEnable.next(
              data.find(permission => permission.action === 'UPDATE_ENV_STATUS').result === 'nok' &&
              data.find(permission => permission.action === 'UPDATE').result === 'nok'
            );
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
        },
        complete: () => {
          this.setBlockUI(false);
          this.loading = false;
          this.detailBodyStyle = 'detail-body ready';
        }
      });
  }
}
