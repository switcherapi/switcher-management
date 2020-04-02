import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-setup',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Setup</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" />
    </div>
    <markdown [src]="'${environment.docsUrl}documentation/setup.md'"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class SetupComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
