import { Component } from '@angular/core';
import { MarkdownInjector } from './markdown-injector.component';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
    selector: 'app-api',
    template: `
    <div class="doc-header">
      <h3 class="doc-title">Switcher API</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" alt="Switcher API">
    </div>
    <markdown [data]="markdown"></markdown>
  `,
    styleUrls: ['../documentation/documentation.component.css'],
    imports: [MarkdownComponent]
})
export class ApiComponent extends MarkdownInjector {

  constructor() {
    super();
    this.init('documentation/api.md');
  }

}
