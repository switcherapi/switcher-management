import { Component } from '@angular/core';
import { MarkdownInjector } from './markdown-injector.component';

@Component({
  selector: 'app-metrics',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Metrics</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" alt="Switcher API">
    </div>
    <markdown [data]="markdown"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css'],
  standalone: false
})
export class MetricsComponent extends MarkdownInjector {

  constructor() {
    super();
    this.init('documentation/metrics.md');
  }

}

