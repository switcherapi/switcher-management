import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Documentation</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" />
    </div>
    <markdown [src]="'${environment.docsUrl}documentation/overview.md'"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
