import { Component, Input, inject } from '@angular/core';
import { SearchDocsResult } from '../model/searchdocs-response';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
    selector: 'app-search-item',
    templateUrl: './search-item.component.html',
    styleUrls: [
        '../../dashboard-module/domain-module/common/css/detail.component.css',
        './search-item.component.css'
    ],
    imports: [MarkdownComponent]
})
export class SearchItemComponent {
  private readonly router = inject(Router);


  @Input()
  searchDocsResult: SearchDocsResult;
  
  gotoDocument(file: string) {
    if (file === 'overview.md') {
      this.router.navigate(['/documentation/']);
      return;
    }
    const route = file.replace('.md', '');
    this.router.navigate(['/documentation/' + route]);
  }

  renderSegment(data: string, documentToRender: string) {
    if (data) {
      return data.replaceAll('[$ASSETS_LOCATION]', environment.docsUrl);
    }

    return `${environment.docsUrl}${documentToRender} not found`;
  }

}
