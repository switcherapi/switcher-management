import { OnDestroy, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { GitOpsSettingsComponent } from './gitops-settings/gitops-settings.component';
import { Types } from 'src/app/model/path-route';
import { FeatureService } from 'src/app/services/feature.service';
import { GitOpsService } from 'src/app/services/gitops.service';
import { GitOpsAccount } from 'src/app/model/gitops';
import { MatDialog } from '@angular/material/dialog';
import { GitOpsEnvSelectionComponent } from './gitops-env-selection/gitops-env-selection.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

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

  @ViewChild(GitOpsSettingsComponent) 
  gitOpsSettings: GitOpsSettingsComponent;

  formGroup: FormGroup;
  formEnvironment = new FormControl();
  formRepository = new FormControl();
  formBranch = new FormControl();
  formToken = new FormControl();
  formSettingsActive = new FormControl();
  formSettingsWindow = new FormControl();
  formSettingsForcePrune = new FormControl();

  gitOpsAccounts: GitOpsAccount[] = [];
  gitOpsSelected: GitOpsAccount;
  domainId: string;
  domainName: string;
  loading = true;
  featureFlag = false;
  fetch = true;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly featureService: FeatureService,
    private readonly gitOpsService: GitOpsService,
    private readonly domainRouteService: DomainRouteService,
    private readonly dialog: MatDialog,
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
    this.formGroup = this.fb.group({
      environment: this.formEnvironment,
      repository: this.formRepository,
      branch: this.formBranch,
      token: this.formToken,
      settingsActive: this.formSettingsActive,
      settingsWindow: this.formSettingsWindow,
      settingsForcePrune: this.formSettingsForcePrune
    });

    this.formEnvironment.valueChanges.subscribe(value => {
      const account = this.gitOpsAccounts.find(account => account.environment === value);
      if (account) {
        this.selectAccount(account);
      }
    });

    this.domainRouteService.updateView(this.domainName, 0);
    this.updateRoute();
    this.readFeatureFlag();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  startNewAccount(): void {
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
      this.gitOpsAccounts = this.gitOpsAccounts.filter(account => account.ID);
      if (this.gitOpsAccounts.length > 0) {
        this.selectAccount(this.gitOpsAccounts[0]);
      }

      if (result) {
        const account = this.buildNewAccount(result.environment);
        this.gitOpsAccounts.push(account);
        this.selectAccount(account);
      }
    });
  }

  getDomainEnvironments(): string[] {
    return this.gitOpsAccounts.map(account => account.environment);
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
        if (this.featureFlag) {
          this.loadAccounts();
        }
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

  private updateRoute(): void {
    if (this.fetch) {
      this.domainRouteService.updatePath(this.domainId, this.domainName, Types.DOMAIN_TYPE, 
        `/dashboard/domain/${this.domainName}/${this.domainId}`);
    }
  }

  private buildNewAccount(environment: string): GitOpsAccount {
    return {
      environment,
      repository: '',
      branch: '',
      token: '',
      domain: {
        id: this.domainId,
        name: this.domainName,
        version: 0,
        lastcommit: '',
        lastdate: '',
        status: 'Pending',
        message: 'Creating GitOps Account'
      },
      settings: {
        active: true,
        window: '1m',
        forceprune: false
      }
    };
  }

  private selectAccount(account: GitOpsAccount): void {
    this.gitOpsSelected = account;
    this.formGroup.patchValue({ environment: account.environment });
  }
  
}