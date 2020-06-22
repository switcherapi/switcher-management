import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-api',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Switcher API</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" />
    </div>
    <markdown [src]="'${environment.docsUrl}documentation/api.md'"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class ApiComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
