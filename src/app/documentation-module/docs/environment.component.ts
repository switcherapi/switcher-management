import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-environment',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Environment</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" />
    </div>
    <markdown [src]="'${environment.docsUrl}documentation/environment.md'"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class EnvironmentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
