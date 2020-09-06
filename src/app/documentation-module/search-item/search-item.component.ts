import { Component, Input } from '@angular/core';
import { SkimmingResult } from '../model/skimming-response';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: [
    '../../dashboard-module/domain-module/common/css/detail.component.css',
    './search-item.component.css'
  ]
})
export class SearchItemComponent {

  @Input()
  skimmmingResult: SkimmingResult;

  constructor(
    private router: Router
  ) { }
  
  gotoDocument(file: string) {
    if (file === 'overview.md') {
      this.router.navigate(['/documentation/']);
      return;
    }
    const route = file.replace('.md', '');
    this.router.navigate(['/documentation/' + route]);
  }

  renderSegment(data: string, documentToRender: string) {
    if (data)
        return data.replace(/\[\$ASSETS_LOCATION\]/g, environment.docsUrl);
      else
        return `${environment.docsUrl}${documentToRender} not found`;
  }

}
