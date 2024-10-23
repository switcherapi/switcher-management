import { OnDestroy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';
import { FeatureService } from 'src/app/services/feature.service';
import { GitOpsService } from 'src/app/services/gitops.service';
import { buildNewGitOpsAccount, GitOpsAccount, TOKEN_VALUE } from 'src/app/model/gitops';
import { MatDialog } from '@angular/material/dialog';
import { GitOpsEnvSelectionComponent } from './gitops-env-selection/gitops-env-selection.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { GitOpsUpdateTokensComponent } from './gitops-update-tokens/gitops-update-tokens.component';
import { windowValidator } from './gitops-validator';
import { ToastService } from 'src/app/_helpers/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';

@Component({
  selector: 'app-ext-gitops',
  templateUrl: './ext-gitops.component.html',
  styleUrls: [
    '../common/css/detail.component.css',
    './ext-gitops.component.css'
  ]
})
export class ExtGitOpsComponent implements OnInit, OnDestroy {
  private readonly unsubscribe = new Subject<void>();

  detailBodyStyle = 'detail-body loading';
  accountDetailsStyle = 'card h-100 header activated';
  accountSettingsStyle = 'card h-100 header transparent';

  formGroup: FormGroup;

  gitOpsAccounts: GitOpsAccount[] = [];
  gitOpsSelected: GitOpsAccount;
  domainId: string;
  domainName: string;
  loading = true;
  reloading = false;
  featureFlag = false;
  fetch = true;
  allowUpdate = false;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly featureService: FeatureService,
    private readonly gitOpsService: GitOpsService,
    private readonly adminService: AdminService,
    private readonly domainRouteService: DomainRouteService,
    private readonly dialog: MatDialog,
    private readonly toastService: ToastService,
    private readonly modalService: NgbModal,
    private readonly fb: FormBuilder
  ) {
    this.activatedRoute.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = decodeURIComponent(params.name);
    });

    this.activatedRoute.paramMap
      .pipe(map(() => window.history.state))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => this.fetch = data.navigationId === 1);
  }

  ngOnInit(): void {
    this.domainRouteService.updateView(this.domainName, 0);
    this.formInit();
    this.loadPermissions();
    this.updateRoute();
    this.readFeatureFlag();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onStartNewAccount(): void {
    const dialogRef = this.dialog.open(GitOpsEnvSelectionComponent, {
      width: '400px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: {
        excludeEnvironments: this.gitOpsAccounts
          .filter(account => account.ID)
          .map(account => account.environment),
        domainId: this.domainId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.purgePendingAccounts();

      if (result) {
        const account = buildNewGitOpsAccount(result.environment, this.domainId, this.domainName);
        this.gitOpsAccounts.push(account);
        this.selectAccount(account);
      }
    });
  }

  onUpdate(): void {
    if (!this.isValid()) {
      return;
    }

    this.gitOpsService.updateGitOpsAccount(this.gitOpsSelected)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          this.selectAccount(data, false);
          this.toastService.showSuccess('GitOps account updated successfully');
        },
        error: () => {
          this.toastService.showError('Failed to update GitOps account');
        }
      });
  }

  onCreate(): void {
    if (!this.isValid()) {
      return;
    }

    this.gitOpsService.subscribeGitOpsAccount(this.gitOpsSelected)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          this.selectAccount(data, false);
          this.gitOpsAccounts = this.gitOpsAccounts.map(account => account.environment === data.environment ? data : account);

          this.toastService.showSuccess('GitOps account created successfully');
        },
        error: () => {
          this.toastService.showError('Failed to create GitOps account');
        }
      });
  }

  onDiscard(): void {
    this.purgePendingAccounts();
  }

  onUpdateTokens(): void {
    const dialogRef = this.dialog.open(GitOpsUpdateTokensComponent, {
      width: '400px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: {
        environments: this.gitOpsAccounts
          .filter(account => account.ID)
          .map(account => account.environment)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.gitOpsService.updateGitOpsAccountTokens(result.token, this.domainId, result.environments)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: data => {
              if (data?.result) {
                this.toastService.showSuccess('GitOps account tokens updated successfully');
              } else {
                this.toastService.showError('Failed to update GitOps account tokens: ' + data?.message);
              }
            },
            error: () => {
              this.toastService.showError('Failed to update GitOps account tokens');
            }
          });
      }
    });
  }

  onUnsubscribe(): void {
    const modalConfirmation = this.modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = `Unsubscribe account for ${this.gitOpsSelected.environment}`;
    modalConfirmation.componentInstance.question = 'Are you sure you want to delete this GitOps account?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.gitOpsService.unsubscribeGitOpsAccount(this.gitOpsSelected)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: () => {
              this.gitOpsAccounts.splice(this.gitOpsAccounts.indexOf(this.gitOpsSelected), 1);

              if (this.gitOpsAccounts.length > 0) {
                this.selectAccount(this.gitOpsAccounts[0]);
              }
              
              this.toastService.showSuccess('GitOps account unsubscribed successfully');
            },
            error: () => {
              this.toastService.showError('Failed to unsubscribe GitOps account');
            }
          });
      }
    });
  }

  onForceRefresh(): void {
    this.gitOpsService.forceRefreshGitOpsAccount(this.gitOpsSelected)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          this.selectAccount(data, false);
          this.gitOpsAccounts = this.gitOpsAccounts.map(account => account.environment === data.environment ? data : account);

          this.toastService.showSuccess('GitOps account refresh command sent successfully');
        },
        error: () => {
          this.toastService.showError('Failed to send refresh command to GitOps account');
        }
      });
  }

  onReload(): void {
    this.reloading = true;

    this.gitOpsService.findGitOpsAccount(this.gitOpsSelected)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data.length) {
            this.selectAccount(data[0], false);
            this.gitOpsAccounts = this.gitOpsAccounts.map(account => account.environment === data[0].environment ? data[0] : account);
          }
          
          setTimeout(() => {
            this.reloading = false;
          }, 5000);
        },
        error: () => {
          this.reloading = false;
        }
      });
  }

  getDomainEnvironments(): string[] {
    return this.gitOpsAccounts.map(account => account.environment);
  }

  hasChanges(): boolean {
    const gitOpsSelectedForm = this.formGroup.value;

    return this.gitOpsSelected.repository !== gitOpsSelectedForm.repository ||
      this.gitOpsSelected.branch !== gitOpsSelectedForm.branch ||
      this.gitOpsSelected.path !== gitOpsSelectedForm.path ||
      this.gitOpsSelected.token !== gitOpsSelectedForm.token ||
      this.gitOpsSelected.settings.active !== gitOpsSelectedForm.active ||
      this.gitOpsSelected.settings.forceprune !== gitOpsSelectedForm.forceprune ||
      this.gitOpsSelected.settings.window !== gitOpsSelectedForm.window;
  }

  canRefresh(): boolean {
    return this.gitOpsSelected.ID && this.gitOpsSelected.domain.lastcommit !== 'refresh';
  }

  canReload(): boolean {
    return this.gitOpsSelected.ID?.length && !this.reloading;
  }

  private formInit(): void {
    this.formGroup = this.fb.group({
      environment: new FormControl('', [Validators.required]),
      repository: new FormControl('', [Validators.required]),
      branch: new FormControl('', [Validators.required]),
      path: new FormControl(''),
      token: new FormControl('', [Validators.required]),
      active: new FormControl(true),
      forceprune: new FormControl(false),
      window: new FormControl('', [windowValidator(), Validators.maxLength(4)]),
    });

    this.formGroup.get('environment').valueChanges.subscribe(value => {
      this.gitOpsSelected = this.gitOpsAccounts.find(account => account.environment === value);
      this.selectAccount(this.gitOpsSelected, false);
    });
  }

  private readFeatureFlag(): void {
    this.featureService.isEnabled({
      feature: 'GITOPS_INTEGRATION',
      parameters: {
        value: this.domainId
      }
    }).subscribe({
      next: data => {
        this.featureFlag = data.status;
        this.loadAccounts();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadAccounts(): void {
    this.gitOpsService.findGitOpsAccounts(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          this.gitOpsAccounts = data;
          this.selectAccount(this.gitOpsAccounts[0]);

          this.loading = false;
          this.detailBodyStyle = 'detail-body ready'
        },
        error: () => {
          this.loading = false;
          this.detailBodyStyle = 'detail-body ready'
        }
      });
  }

  private loadPermissions(): void {
    this.adminService.readCollabPermission(this.domainId, ['UPDATE'], 'ADMIN')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        data.forEach(perm => {
          if (perm.action === 'UPDATE') {
            this.allowUpdate = perm.result === 'ok';
          }
        });
      }
      );
  }

  private updateRoute(): void {
    if (this.fetch) {
      this.domainRouteService.updatePath(this.domainId, this.domainName, Types.DOMAIN_TYPE,
        `/dashboard/domain/${this.domainName}/${this.domainId}`);
    }
  }

  private selectAccount(account: GitOpsAccount, selectEnv = true): void {
    this.setStatusStyle(account);

    // Mask token value
    account.token = account.token?.length ? TOKEN_VALUE : '';
    this.gitOpsSelected = account;

    this.formGroup.patchValue({
      repository: account.repository,
      branch: account.branch,
      path: account.path,
      token: account.token,
      active: account.settings.active,
      forceprune: account.settings.forceprune,
      window: account.settings.window
    });

    if (selectEnv) {
      this.formGroup.patchValue({
        environment: account.environment
      });
    }
  }

  private setStatusStyle(account: GitOpsAccount): void {
    if (account.domain.status === 'Synced') {
      this.accountDetailsStyle = 'card h-100 header activated';
    } else if (account.domain.status === 'Error') {
      this.accountDetailsStyle = 'card h-100 header editing';
    } else {
      this.accountDetailsStyle = 'card h-100 header deactivated';
    }
  }

  private isValid(): boolean {
    if (!this.formGroup.valid) {
      return false
    }

    const gitOpsSelectedForm = this.formGroup.value;

    this.gitOpsSelected.repository = gitOpsSelectedForm.repository;
    this.gitOpsSelected.branch = gitOpsSelectedForm.branch;
    this.gitOpsSelected.path = gitOpsSelectedForm.path;
    this.gitOpsSelected.token = gitOpsSelectedForm.token;
    this.gitOpsSelected.settings.active = gitOpsSelectedForm.active;
    this.gitOpsSelected.settings.forceprune = gitOpsSelectedForm.forceprune;
    this.gitOpsSelected.settings.window = gitOpsSelectedForm.window;

    return true;
  }

  private purgePendingAccounts(): void {
    this.gitOpsAccounts = this.gitOpsAccounts.filter(account => account.ID);
    if (this.gitOpsAccounts.length > 0) {
      this.selectAccount(this.gitOpsAccounts[0]);
    }
  }
}