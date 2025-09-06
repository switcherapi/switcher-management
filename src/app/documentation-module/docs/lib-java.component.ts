import { Component } from '@angular/core';
import { MarkdownInjector } from './markdown-injector.component';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
    selector: 'app-libjava',
    template: `
    <div class="doc-header">
      <h3 class="doc-title">Java Library</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" alt="Switcher API">
    </div>
    <markdown [data]="markdown"></markdown>
  `,
    styleUrls: ['../documentation/documentation.component.css'],
    imports: [MarkdownComponent]
})
export class LibJavaComponent extends MarkdownInjector {
  
  constructor() {
    super();
    this.init('documentation/libjava.md');
  }

}
