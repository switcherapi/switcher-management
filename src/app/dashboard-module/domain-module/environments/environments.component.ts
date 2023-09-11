import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { ToastService } from 'src/app/_helpers/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { Environment } from 'src/app/model/environment';
import { AdminService } from 'src/app/services/admin.service';
import { EnvironmentService } from 'src/app/services/environment.service';
import { ActivatedRoute } from '@angular/router';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';

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

  domainId: string;
  domainName: string;
  classStatus = "card mt-4 loading";
  loading = true;
  creating = false;
  error = '';
  fetch = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private domainRouteService: DomainRouteService,
    private adminService: AdminService,
    private envService: EnvironmentService,
    private toastService: ToastService,
    private _modalService: NgbModal,
    private errorHandler: RouterErrorHandler
  ) { 
    this.activatedRoute.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = decodeURIComponent(params.name);
    });

    this.activatedRoute.paramMap
      .pipe(map(() => window.history.state))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => this.fetch = data.fetch == undefined);
  }

  ngOnInit() {
    this.loadEnvironments();
    this.readPermissionToObject();
    this.updateRoute();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  createEnvironment() {
    const { valid } = this.envFormControl;

    if (valid) {
      const envName = this.envFormControl.value;
      this.envFormControl.reset();
      this.creating = true;

      this.envService.createEnvironment(this.domainId, envName)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(env => {
          if (env) {
            this.environments.push(env);
            this.toastService.showSuccess('Environment created with success');
          }
        }, error => {
          this.toastService.showError(error.error);
          ConsoleLogger.printError(error);
        }, () => {
          this.creating = false;
        });
    } else {
      this.toastService.showError('Unable to create this Environment');
    }
  }

  removeEnvironment(selectedEnvironment: Environment) {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
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
    });
  }

  resetEnvironment(selectedEnvironment: Environment) {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
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
    });
  }
  
  private loadEnvironments(): void {
    this.loading = true;
    this.envService.getEnvironmentsByDomainId(this.domainId)
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

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['CREATE', 'UPDATE', 'DELETE'], 'ENVIRONMENT', 'name', this.domainName)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          data.forEach(element => {
            if (element.action === 'UPDATE') {
              this.updatable = element.result === 'ok';
            } else if (element.action === 'DELETE') {
              this.removable = element.result === 'ok';
            } else if (element.action === 'CREATE') {
              this.creatable = element.result === 'ok';
            }
          });
        }
    });
  }

  private updateRoute(): void {
    this.domainRouteService.updateView('Environments', 4);

    if (this.fetch) {
      this.domainRouteService.updatePath(this.domainId, this.domainName, Types.DOMAIN_TYPE, 
        `/dashboard/domain/${this.domainName}/${this.domainId}`);
    }
  }

}
