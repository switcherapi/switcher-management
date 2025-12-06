import { Component, inject, signal, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
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
export class SearchComponent {
  private readonly searchDocsService = inject(SearchDocsService);
  private readonly route = inject(ActivatedRoute);

  readonly query = toSignal(
    this.route.paramMap.pipe(
      switchMap(params => of(params.get('query')))
    ),
    { initialValue: null }
  );
  
  readonly searchDocsResponse = signal<SearchDocsResponse | null>(null);
  readonly loading = signal<boolean>(true);

  constructor() {
    effect(() => {
      const currentQuery = this.query();
      if (currentQuery) {
        this.loading.set(true);
        this.searchDocsService.search(currentQuery).subscribe(result => {
          this.searchDocsResponse.set(result);
          this.loading.set(false);
        });
      }
    });
  }

}
