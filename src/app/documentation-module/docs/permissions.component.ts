import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-permissions',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Permissions</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" />
    </div>
    <markdown [src]="'${environment.docsUrl}documentation/permissions.md'"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class PermissionsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
