import { Component } from '@angular/core';
import { MarkdownInjector } from './markdown-injector.component';
import { MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-environment',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Environment</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" alt="Switcher API">
    </div>
    <markdown [data]="markdown"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class EnvironmentComponent extends MarkdownInjector {

  constructor(private readonly markdownComponentService: MarkdownService) {
    super(markdownComponentService, 'documentation/environment.md');
  }

}
