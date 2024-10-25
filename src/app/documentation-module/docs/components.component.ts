import { Component } from '@angular/core';
import { MarkdownService } from 'ngx-markdown';
import { MarkdownInjector } from './markdown-injector.component';

@Component({
  selector: 'app-components',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Components</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" alt="Switcher API">
    </div>
    <markdown [data]="markdown"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class ComponentsComponent extends MarkdownInjector {

  constructor(private readonly markdownComponentService: MarkdownService) {
    super(markdownComponentService, 'documentation/components.md');
  }

}
