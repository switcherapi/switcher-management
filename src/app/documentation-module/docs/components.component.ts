import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-components',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Components</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" />
    </div>
    <markdown [src]="'assets/documentation/components.md'"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class ComponentsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
