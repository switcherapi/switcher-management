import { OnDestroy, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { GitOpsSettingsComponent } from './gitops-settings/gitops-settings.component';
import { Types } from 'src/app/model/path-route';
import { FeatureService } from 'src/app/services/feature.service';

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

  domainId: string;
  domainName: string;
  loading = true;
  featureFlag = false;
  fetch = true;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly featureService: FeatureService,
    private readonly domainRouteService: DomainRouteService
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
    this.updateRoute();

    this.featureService.isEnabled({ 
      feature: 'GITOPS_INTEGRATION', 
      parameters: {
        value: this.domainId
      }
    }).subscribe((response) => {
      this.loading = false;
      this.detailBodyStyle = 'detail-body ready';
      this.featureFlag = response.status;
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private updateRoute(): void {
    if (this.fetch) {
      this.domainRouteService.updatePath(this.domainId, this.domainName, Types.DOMAIN_TYPE, 
        `/dashboard/domain/${this.domainName}/${this.domainId}`);
    }
  }
  
}