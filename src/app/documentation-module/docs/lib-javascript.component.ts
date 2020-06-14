import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-libjavascript',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">JavaScript Library</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" />
    </div>
    <markdown [src]="'${environment.docsUrl}documentation/libjavascript.md'"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class LibJavaScriptComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
