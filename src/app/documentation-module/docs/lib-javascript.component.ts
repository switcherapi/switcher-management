import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-libjavascript',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">JavaScript Client</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" />
    </div>
    <markdown [src]="'assets/documentation/libjavascript.md'"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class LibJavaScriptComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
