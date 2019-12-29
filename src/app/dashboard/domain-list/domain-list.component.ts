import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { Domain } from '../domain/model/domain';

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
    private dashboardService: DashboardService
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
      this.error = error;
      this.loading = false;
    });
  }
}
