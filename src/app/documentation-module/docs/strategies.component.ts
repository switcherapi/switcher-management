import { Component } from '@angular/core';
import { MarkdownInjector } from './markdown-injector.component';
import { MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-strategies',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Strategies</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" alt="Switcher API">
    </div>
    <markdown [data]="markdown"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class StrategiesComponent extends MarkdownInjector {

  constructor(private markdownComponentService: MarkdownService) {
    super(markdownComponentService, 'documentation/strategies.md');
  }

}
