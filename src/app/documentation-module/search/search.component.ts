import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SearchDocsService } from '../services/searchdocs.service';
import { SearchDocsResponse } from '../model/searchdocs-response';
import { SearchItemComponent } from '../search-item/search-item.component';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: [
        './search.component.css',
        '../documentation/documentation.component.css'
    ],
    imports: [SearchItemComponent]
})
export class SearchComponent implements OnInit, OnDestroy {
  private readonly searchDocsService = inject(SearchDocsService);
  private readonly route = inject(ActivatedRoute);

  private readonly unsubscribe = new Subject<void>();

  query: string;
  searchDocsResponse: SearchDocsResponse;
  loading = true;

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
