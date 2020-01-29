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

  constructor(
    private envService: EnvironmentService,
    private domainRouteService: DomainRouteService,
    private toastService: ToastService,
    private _modalService: NgbModal
  ) { }

  ngOnInit() {
    this.loadEnvironments();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadEnvironments(): void {
    this.envService.getEnvironmentsByDomainId(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(env => {
        this.environments = env.filter(e => e.name != 'default');
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
          console.log(error);
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
          console.log(error);
          this.toastService.showError('Unable to reset this Environment');
        });
      }
    })
  }

}
