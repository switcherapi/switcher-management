import { Component } from '@angular/core';
import { MarkdownInjector } from './markdown-injector.component';
import { MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-home',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Slack App Installation</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" alt="Switcher API">
    </div>
    <markdown [data]="markdown"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css'],
  standalone: false
})
export class SlackInstallationDocsComponent extends MarkdownInjector {

  constructor(private readonly markdownComponentService: MarkdownService) {
    super(markdownComponentService, 'documentation/slack_installation.md');
  }

}
