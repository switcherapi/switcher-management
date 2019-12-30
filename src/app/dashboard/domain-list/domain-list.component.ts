import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { Domain } from '../domain/model/domain';
import { environment } from 'src/environments/environment';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';

@Component({
  selector: 'app-domain-list',
  templateUrl: './domain-list.component.html',
  styleUrls: ['./domain-list.component.css']
})
export class DomainListComponent implements OnInit {
  domains$: Domain[];
  loading = false;
  error = '';

  constructor(
    private dashboardService: DashboardService,
    private errorHandler: RouterErrorHandler
  ) { }

  ngOnInit() {
    this.loading = true;
    this.error = '';
    this.dashboardService.getDomains().subscribe(data => {
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
}
