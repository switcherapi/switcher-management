import { Component, inject, signal, effect, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';
import { FeatureService } from 'src/app/services/feature.service';
import { GitOpsService } from 'src/app/services/gitops.service';
import { buildNewGitOpsAccount, GitOpsAccount, TOKEN_VALUE } from 'src/app/model/gitops';
import { MatDialog } from '@angular/material/dialog';
import { GitOpsEnvSelectionComponent } from './gitops-env-selection/gitops-env-selection.component';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { GitOpsUpdateTokensComponent } from './gitops-update-tokens/gitops-update-tokens.component';
import { pathValidator, windowValidator } from './gitops-validator';
import { ToastService } from 'src/app/_helpers/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { NgClass } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
    selector: 'app-ext-gitops',
    templateUrl: './ext-gitops.component.html',
    styleUrls: [
        '../common/css/detail.component.css',
        './ext-gitops.component.css'
    ],
    imports: [NgClass, MatButton, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, MatFormField, 
      MatLabel, MatInput, MatTooltip, MatProgressSpinner, MatSelect, FormsModule, ReactiveFormsModule, 
      MatOption, MatSlideToggle
    ]
})
export class ExtGitOpsComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly featureService = inject(FeatureService);
  private readonly gitOpsService = inject(GitOpsService);
  private readonly adminService = inject(AdminService);
  private readonly domainRouteService = inject(DomainRouteService);
  private readonly dialog = inject(MatDialog);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(NgbModal);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  detailBodyStyle = signal('detail-body loading');
  accountDetailsStyle = signal('card h-100 header activated');
  accountSettingsStyle = signal('card h-100 header transparent');

  formGroup = signal<FormGroup>(null);

  gitOpsAccounts = signal<GitOpsAccount[]>([]);
  gitOpsSelected = signal<GitOpsAccount>(null);
  domainId = signal<string>('');
  domainName = signal<string>('');
  loading = signal(true);
  reloading = signal(false);
  featureFlag = signal(false);
  fetch = signal(true);
  allowUpdate = signal(false);

  constructor() {
    // Route params subscription
    this.activatedRoute.parent.params.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      this.domainId.set(params.domainid);
      this.domainName.set(decodeURIComponent(params.name));
    });

    // Navigation state subscription
    this.activatedRoute.paramMap
      .pipe(
        map(() => globalThis.history.state),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(data => this.fetch.set(data.navigationId === 1));

    // Initialize when domainId is available
    effect(() => {
      const domainId = this.domainId();
      const domainName = this.domainName();
      
      if (domainId && domainName) {
        this.domainRouteService.updateView(domainName, 0);
        this.formInit();
        this.loadPermissions();
        this.updateRoute();
        this.readFeatureFlag();
      }
    });
  }

  onStartNewAccount(): void {
    const dialogRef = this.dialog.open(GitOpsEnvSelectionComponent, {
      width: '400px',
      minWidth: globalThis.innerWidth < 450 ? '95vw' : '',
      data: {
        excludeEnvironments: this.gitOpsAccounts()
          .filter(account => account.ID)
          .map(account => account.environment),
        domainId: this.domainId()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.purgePendingAccounts();

      if (result) {
        const account = buildNewGitOpsAccount(result.environment, this.domainId(), this.domainName());
        const currentAccounts = this.gitOpsAccounts();
        this.gitOpsAccounts.set([...currentAccounts, account]);
        this.selectAccount(account);
      }
    });
  }

  onUpdate(): void {
    if (!this.isValid()) {
      return;
    }

    this.gitOpsService.updateGitOpsAccount(this.gitOpsSelected())
      .pipe(takeUntilDestroyed(this.destroyRef))
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

    this.gitOpsService.subscribeGitOpsAccount(this.gitOpsSelected())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.selectAccount(data, false);
          const updatedAccounts = this.gitOpsAccounts().map(account => 
            account.environment === data.environment ? data : account
          );
          this.gitOpsAccounts.set(updatedAccounts);

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
      minWidth: globalThis.innerWidth < 450 ? '95vw' : '',
      data: {
        environments: this.gitOpsAccounts()
          .filter(account => account.ID)
          .map(account => account.environment)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.gitOpsService.updateGitOpsAccountTokens(result.token, this.domainId(), result.environments)
          .pipe(takeUntilDestroyed(this.destroyRef))
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
    const selectedAccount = this.gitOpsSelected();
    const modalConfirmation = this.modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = `Unsubscribe account for ${selectedAccount.environment}`;
    modalConfirmation.componentInstance.question = 'Are you sure you want to delete this GitOps account?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.gitOpsService.unsubscribeGitOpsAccount(selectedAccount)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              const currentAccounts = this.gitOpsAccounts();
              const updatedAccounts = currentAccounts.filter(account => account !== selectedAccount);
              this.gitOpsAccounts.set(updatedAccounts);

              if (updatedAccounts.length > 0) {
                this.selectAccount(updatedAccounts[0]);
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
    this.gitOpsService.forceRefreshGitOpsAccount(this.gitOpsSelected())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.selectAccount(data, false);
          const updatedAccounts = this.gitOpsAccounts().map(account => 
            account.environment === data.environment ? data : account
          );
          this.gitOpsAccounts.set(updatedAccounts);

          this.toastService.showSuccess('GitOps account refresh command sent successfully');
        },
        error: () => {
          this.toastService.showError('Failed to send refresh command to GitOps account');
        }
      });
  }

  onReload(): void {
    this.reloading.set(true);

    this.gitOpsService.findGitOpsAccount(this.gitOpsSelected())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          if (data.length) {
            this.selectAccount(data[0], false);
            const updatedAccounts = this.gitOpsAccounts().map(account => 
              account.environment === data[0].environment ? data[0] : account
            );
            this.gitOpsAccounts.set(updatedAccounts);
          }
          
          setTimeout(() => {
            this.reloading.set(false);
          }, 5000);
        },
        error: () => {
          this.reloading.set(false);
        }
      });
  }

  getDomainEnvironments(): string[] {
    return this.gitOpsAccounts().map(account => account.environment);
  }

  hasChanges(): boolean {
    const formGroup = this.formGroup();
    const gitOpsSelected = this.gitOpsSelected();
    
    if (!formGroup || !gitOpsSelected) {
      return false;
    }
    
    const gitOpsSelectedForm = formGroup.value;

    return gitOpsSelected.repository !== gitOpsSelectedForm.repository ||
      gitOpsSelected.branch !== gitOpsSelectedForm.branch ||
      gitOpsSelected.path !== gitOpsSelectedForm.path ||
      gitOpsSelected.token !== gitOpsSelectedForm.token ||
      gitOpsSelected.settings.active !== gitOpsSelectedForm.active ||
      gitOpsSelected.settings.forceprune !== gitOpsSelectedForm.forceprune ||
      gitOpsSelected.settings.window !== gitOpsSelectedForm.window;
  }

  canRefresh(): boolean {
    const selected = this.gitOpsSelected();
    return selected?.ID && selected.domain.lastcommit !== 'refresh';
  }

  canReload(): boolean {
    const selected = this.gitOpsSelected();
    return selected?.ID?.length && !this.reloading();
  }

  private formInit(): void {
    const formGroup = this.fb.group({
      environment: new FormControl('', [Validators.required]),
      repository: new FormControl('', [Validators.required]),
      branch: new FormControl('', [Validators.required]),
      path: new FormControl('', [pathValidator(), Validators.maxLength(255)]),
      token: new FormControl('', [Validators.required]),
      active: new FormControl(true),
      forceprune: new FormControl(false),
      window: new FormControl('', [windowValidator(), Validators.maxLength(4)]),
    });
    
    this.formGroup.set(formGroup);

    formGroup.get('environment').valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      const selected = this.gitOpsAccounts().find(account => account.environment === value);
      this.gitOpsSelected.set(selected);
      this.selectAccount(selected, false);
    });
  }

  private readFeatureFlag(): void {
    this.featureService.isEnabled({
      feature: 'GITOPS_INTEGRATION',
      parameters: {
        value: this.domainId()
      }
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.featureFlag.set(data.status);
        this.loadAccounts();
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private loadAccounts(): void {
    this.gitOpsService.findGitOpsAccounts(this.domainId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.gitOpsAccounts.set(data);
          this.selectAccount(data[0]);

          this.loading.set(false);
          this.detailBodyStyle.set('detail-body ready')
        },
        error: () => {
          this.loading.set(false);
          this.detailBodyStyle.set('detail-body ready')
        }
      });
  }

  private loadPermissions(): void {
    this.adminService.readCollabPermission(this.domainId(), ['UPDATE'], 'ADMIN')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        for (const perm of data) {
          if (perm.action === 'UPDATE') {
            this.allowUpdate.set(perm.result === 'ok');
          }
        }
      });
  }

  private updateRoute(): void {
    if (this.fetch()) {
      this.domainRouteService.updatePath(this.domainId(), this.domainName(), Types.DOMAIN_TYPE,
        `/dashboard/domain/${this.domainName()}/${this.domainId()}`);
    } else {
      this.domainRouteService.refreshPath();
    }
  }

  private selectAccount(account: GitOpsAccount, selectEnv = true): void {
    if (!account) return;
    
    this.setStatusStyle(account);

    // Mask token value
    account.token = account.token?.length ? TOKEN_VALUE : '';
    this.gitOpsSelected.set(account);

    const formGroup = this.formGroup();
    if (formGroup) {
      formGroup.patchValue({
        repository: account.repository,
        branch: account.branch,
        path: account.path,
        token: account.token,
        active: account.settings.active,
        forceprune: account.settings.forceprune,
        window: account.settings.window
      });

      if (selectEnv) {
        formGroup.patchValue({
          environment: account.environment
        });
      }
    }
  }

  private setStatusStyle(account: GitOpsAccount): void {
    if (account.domain.status === 'Synced') {
      this.accountDetailsStyle.set('card h-100 header activated');
    } else if (account.domain.status === 'Error') {
      this.accountDetailsStyle.set('card h-100 header editing');
    } else {
      this.accountDetailsStyle.set('card h-100 header deactivated');
    }
  }

  private isValid(): boolean {
    const formGroup = this.formGroup();
    const gitOpsSelected = this.gitOpsSelected();
    
    if (!formGroup?.valid || !gitOpsSelected) {
      return false;
    }

    const gitOpsSelectedForm = formGroup.value;

    gitOpsSelected.repository = gitOpsSelectedForm.repository;
    gitOpsSelected.branch = gitOpsSelectedForm.branch;
    gitOpsSelected.path = gitOpsSelectedForm.path;
    gitOpsSelected.token = gitOpsSelectedForm.token;
    gitOpsSelected.settings.active = gitOpsSelectedForm.active;
    gitOpsSelected.settings.forceprune = gitOpsSelectedForm.forceprune;
    gitOpsSelected.settings.window = gitOpsSelectedForm.window;

    return true;
  }

  private purgePendingAccounts(): void {
    const filteredAccounts = this.gitOpsAccounts().filter(account => account.ID);
    this.gitOpsAccounts.set(filteredAccounts);
    
    if (filteredAccounts.length > 0) {
      this.selectAccount(filteredAccounts[0]);
    }
  }
}