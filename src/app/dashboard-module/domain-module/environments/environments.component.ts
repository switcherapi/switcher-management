import { Component, OnInit, OnDestroy } from '@angular/core';
import { EnvironmentService } from '../../services/environment.service';
import { DomainRouteService } from '../../services/domain-route.service';
import { Types } from '../model/path-route';
import { Environment } from '../model/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { ToastService } from 'src/app/_helpers/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirm } from 'src/app/_helpers/confirmation-dialog';
import { AdminService } from '../../services/admin.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';

@Component({
  selector: 'app-environments',
  templateUrl: './environments.component.html',
  styleUrls: [
    '../common/css/list.component.css',
    '../common/css/preview.component.css',
    './environments.component.css'
  ]
})
export class EnvironmentsComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  environments: Environment[];

  envFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  updatable: boolean = false;
  removable: boolean = false;
  creatable: boolean = false;

  classStatus = "card mt-4 loading";
  loading = true;
  error = '';

  constructor(
    private adminService: AdminService,
    private envService: EnvironmentService,
    private domainRouteService: DomainRouteService,
    private toastService: ToastService,
    private _modalService: NgbModal,
    private errorHandler: RouterErrorHandler
  ) { }

  ngOnInit() {
    this.loadEnvironments();
    this.readPermissionToObject();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadEnvironments(): void {
    this.loading = true;
    this.envService.getEnvironmentsByDomainId(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(env => {
        this.environments = env.filter(e => e.name != 'default');
    }, error => {
      this.error = error;
      this.loading = false;
      this.error = this.errorHandler.doError(error);
    }, () => {
      this.loading = false;
      this.classStatus = "card mt-4 ready";
    });
  }

  readPermissionToObject(): void {
    const domain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
    this.adminService.readCollabPermission(domain.id, ['CREATE', 'UPDATE', 'DELETE'], 'ENVIRONMENT', 'name', domain.name)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'UPDATE') {
            this.updatable = element.result === 'ok' ? true : false;
          } else if (element.action === 'DELETE') {
            this.removable = element.result === 'ok' ? true : false;
          } else if (element.action === 'CREATE') {
            this.creatable = element.result === 'ok' ? true : false;
          }
        });
      }
    });
  }

  createEnvironment() {
    const { valid } = this.envFormControl;

    if (valid) {
      this.envService.createEnvironment(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id, this.envFormControl.value)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(env => {
          if (env) {
            this.environments.push(env);
            this.toastService.showSuccess('Environment created with success');
          }
        }, error => {
          this.toastService.showError(error.error);
        });
    } else {
      this.toastService.showError('Unable to create this Environment');
    }
  }

  removeEnvironment(selectedEnvironment: Environment) {
    const modalConfirmation = this._modalService.open(NgbdModalConfirm);
    modalConfirmation.componentInstance.title = 'Environment Removal';
    modalConfirmation.componentInstance.question = `Are you sure you want to remove ${selectedEnvironment.name}?`;
    modalConfirmation.result.then((result) => {
      if (result) {
        const environment = this.environments.filter(env => env.id === selectedEnvironment.id);

        this.envService.deleteEnvironment(selectedEnvironment.id)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(env => {
          if (env) {
            this.environments.splice(this.environments.indexOf(environment[0]), 1);
            this.toastService.showSuccess('Environment removed with success');
          }
        }, error => {
          ConsoleLogger.printError(error);
          this.toastService.showError('Unable to remove this Environment');
        });
      }
    })
  }

  resetEnvironment(selectedEnvironment: Environment) {
    const modalConfirmation = this._modalService.open(NgbdModalConfirm);
    modalConfirmation.componentInstance.title = 'Environment Reset';
    modalConfirmation.componentInstance.question = `Are you sure you want to reset ${selectedEnvironment.name}?
      Strategies are going to be deleted for this environment.`;
    modalConfirmation.result.then((result) => {
      if (result) {
        this.envService.resetEnvironment(selectedEnvironment.id)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(env => {
          if (env) {
            this.toastService.showSuccess('Environment reseted with success');
          }
        }, error => {
          ConsoleLogger.printError(error);
          this.toastService.showError('Unable to reset this Environment');
        });
      }
    })
  }

}
