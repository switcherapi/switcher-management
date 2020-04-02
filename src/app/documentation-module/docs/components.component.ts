import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-components',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Components</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" />
    </div>
    <markdown [src]="'${environment.docsUrl}documentation/components.md'"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class ComponentsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
