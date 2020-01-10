import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomainService } from '../services/domain.service';
import { Domain } from '../domain-module/model/domain';
import { environment } from 'src/environments/environment';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-domain-list',
  templateUrl: './domain-list.component.html',
  styleUrls: ['./domain-list.component.css']
})
export class DomainListComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  domains$: Domain[];
  loading = false;
  error = '';

  constructor(
    private domainService: DomainService,
    private errorHandler: RouterErrorHandler
  ) { }

  ngOnInit() {
    this.loading = true;
    this.error = '';
    this.domainService.getDomains().pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.domains$ = data;
      }
      this.loading = false;
    }, error => {
      this.error = this.errorHandler.doError(error);
      this.loading = false;
    });

    setTimeout(() => {
      if (!this.domains$) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loading = false;
    }, environment.timeout);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
