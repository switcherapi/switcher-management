import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SearchDocsService } from '../services/searchdocs.service';
import { SearchDocsResponse } from '../model/searchdocs-response';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: [
    './search.component.css',
    '../documentation/documentation.component.css'
  ]
})
export class SearchComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject<void>();

  query: string;
  searchDocsResponse: SearchDocsResponse;
  loading = true;

  constructor(
    private searchDocsService: SearchDocsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.route.paramMap.subscribe(params => {
      this.query = params.get("query");
      if (this.query) {
        this.searchDocsService.search(this.query).pipe(takeUntil(this.unsubscribe)).subscribe(result => {
          this.searchDocsResponse = result;
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
