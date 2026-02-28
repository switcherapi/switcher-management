import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { NgClass } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { SpecialCharacterDirective } from '../common/special.char.directive';

@Component({
    selector: 'app-environments',
    templateUrl: './environments.component.html',
    styleUrls: [
        '../common/css/list.component.css',
        '../common/css/preview.component.css',
        './environments.component.css'
    ],
    imports: [NgClass, MatButton, MatIcon, MatProgressSpinner, MatFormField, MatLabel, MatInput, FormsModule, SpecialCharacterDirective, ReactiveFormsModule]
})
export class EnvironmentsComponent implements OnInit, OnDestroy {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly domainRouteService = inject(DomainRouteService);
  private readonly adminService = inject(AdminService);
  private readonly envService = inject(EnvironmentService);
  private readonly toastService = inject(ToastService);
  private readonly _modalService = inject(NgbModal);
  private readonly errorHandler = inject(RouterErrorHandler);

  private readonly unsubscribe = new Subject<void>();

  environments = signal<Environment[]>([]);
  filterText = signal<string>('');
  filteredEnvironments = computed(() => this.filterEnvironments());

  envFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  updatable = signal(false);
  removable = signal(false);
  creatable = signal(false);

  domainId: string;
  domainName: string;
  classStatus = signal('card mt-4 loading');
  loading = signal(true);
  creating = signal(false);
  error = signal('');
  fetch = true;

  constructor() { 
    this.activatedRoute.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = decodeURIComponent(params.name);
    });

    this.activatedRoute.paramMap
      .pipe(map(() => globalThis.history.state))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => this.fetch = data.navigationId === 1);
  }

  ngOnInit() {
    this.loadEnvironments();
    this.readPermissionToObject();
    this.updateRoute();
    
    // Subscribe to form control changes for filtering
    this.envFormControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(value => this.filterText.set(value || ''));
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
      this.creating.set(true);

      this.envService.createEnvironment(this.domainId, envName)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: env => {
            if (env) {
              const currentEnvironments = this.environments();
              this.environments.set([...currentEnvironments, env]);
              this.toastService.showSuccess('Environment created with success');
            }
          },
          error: error => {
            this.creating.set(false);
            this.toastService.showError(error.error);
            ConsoleLogger.printError(error);
          },
          complete: () => {
            this.creating.set(false);
          }
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
        const currentEnvironments = this.environments();

        this.envService.deleteEnvironment(selectedEnvironment.id)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: env => {
            if (env) {
              const updatedEnvironments = currentEnvironments.filter(e => e.id !== selectedEnvironment.id);
              this.environments.set(updatedEnvironments);
              this.toastService.showSuccess('Environment removed with success');
            }
          },
          error: error => {
            ConsoleLogger.printError(error);
            this.toastService.showError('Unable to remove this Environment');
          }
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
        .subscribe({
          next: env => {
            if (env) {
              this.toastService.showSuccess('Environment reseted with success');
            }
          },
          error: error => {
            ConsoleLogger.printError(error);
            this.toastService.showError('Unable to reset this Environment');
          }
        });
      }
    });
  }
  
  private loadEnvironments(): void {
    this.loading.set(true);
    this.envService.getEnvironmentsByDomainId(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: env => {
          this.environments.set(env.filter(e => e.name != 'default'));
        },
        error: error => {
          this.error.set(this.errorHandler.doError(error));
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
          this.classStatus.set('card mt-4 ready');
        }
      });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['CREATE', 'UPDATE', 'DELETE'], 'ENVIRONMENT')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          for (const element of data) {
            if (element.action === 'UPDATE') {
              this.updatable.set(element.result === 'ok');
            } else if (element.action === 'DELETE') {
              this.removable.set(element.result === 'ok');
            } else if (element.action === 'CREATE') {
              this.creatable.set(element.result === 'ok');
            }
          }
        }
    });
  }

  private updateRoute(): void {
    this.domainRouteService.updateView('Environments', 4);

    if (this.fetch) {
      this.domainRouteService.updatePath(this.domainId, this.domainName, Types.DOMAIN_TYPE, 
        `/dashboard/domain/${this.domainName}/${this.domainId}`);
    } else {
      this.domainRouteService.refreshPath();
    }
  }

  private filterEnvironments(): Environment[] {
    const filter = this.filterText().toLowerCase().trim();

    if (!filter) {
      return this.environments();
    }

    return this.environments().filter(environment => 
      environment.name.toLowerCase().includes(filter)
    );
  }

}
