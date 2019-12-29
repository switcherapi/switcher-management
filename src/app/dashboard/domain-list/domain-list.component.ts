import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { Domain } from '../domain/model/domain';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-domain-list',
  templateUrl: './domain-list.component.html',
  styleUrls: ['./domain-list.component.css']
})
export class DomainListComponent implements OnInit {
  domains$: Observable<Domain[]>;

  constructor(
    private dashboardService: DashboardService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.domains$ = this.route.paramMap.pipe(
      switchMap(() => {
        return this.dashboardService.getDomains();
      })
    );
  }
}
