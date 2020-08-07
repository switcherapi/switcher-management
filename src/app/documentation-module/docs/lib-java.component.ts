import { Component } from '@angular/core';
import { MarkdownInjector } from './markdown-injector.component';
import { MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-libjava',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Java Library</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" />
    </div>
    <markdown [data]="markdown"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class LibJavaComponent extends MarkdownInjector {

  constructor(private markdownComponentService: MarkdownService) {
    super(markdownComponentService, 'documentation/libjava.md');
   }

}
