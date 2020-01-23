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
import { MatDialog } from '@angular/material';
import { DomainCreateComponent } from '../../domain-create/domain-create.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
    if (!this.editing) {
      this.classStatus = 'header editing';
      this.editing = true;
    } else {
      this.domainDescription = this.descElement.nativeElement.value;
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
      this.domainService.updateDomain(this.getDomain().id, this.domainDescription).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data) {
          this.updatePathRoute(data);
          this.toastService.showSucess(`Domain updated with success`);
          this.editing = false;
        }
      }, error => {
        this.toastService.showError(`Unable to update '${this.getDomain().name}' domain`);
        this.editing = false;
      });
    }
  }

  generateApiKey() {
    this._modalService.open(NgbdModalConfirm).result.then(() => {
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
    }).catch(reject => {});
  }
}

@Component({
  selector: 'ngbd-modal-confirm',
  template: `
    <div class="modal-header">
      <h4 class="modal-title" id="modal-title">API Key</h4>
      <button type="button" class="close" aria-describedby="modal-title" (click)="modal.dismiss()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p><strong>Are you sure you want to generate a new key for this domain?</strong></p>
      <span class="text-danger">This operation can not be undone.</span>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="modal.dismiss()">Cancel</button>
      <button type="button" class="btn btn-danger" (click)="modal.close()">Ok</button>
    </div>
    `
})
export class NgbdModalConfirm {
  constructor(public modal: NgbActiveModal) {}
}
