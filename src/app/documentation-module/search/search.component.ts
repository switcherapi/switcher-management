import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SkimmingService } from '../services/skimming.service';
import { SkimmingResponse } from '../model/skimming-response';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: [
    './search.component.css',
    '../documentation/documentation.component.css'
  ]
})
export class SearchComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  query: string;
  skimmingResponse: SkimmingResponse;
  loading: boolean = true;

  constructor(
    private skimmingService: SkimmingService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.route.paramMap.subscribe(params => {
      this.query = params.get("query");
      if (this.query) {
        this.skimmingService.skim(this.query).pipe(takeUntil(this.unsubscribe)).subscribe(result => {
          this.skimmingResponse = result;
          this.loading = false;
        });
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
