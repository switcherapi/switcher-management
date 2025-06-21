import { Component } from '@angular/core';
import { MarkdownInjector } from './markdown-injector.component';

@Component({
  selector: 'app-setup',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Setup</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" alt="Switcher API">
    </div>
    <markdown [data]="markdown"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css'],
  standalone: false
})
export class SetupComponent extends MarkdownInjector {

  constructor() {
    super();
    this.init('documentation/setup.md');
  }

}
