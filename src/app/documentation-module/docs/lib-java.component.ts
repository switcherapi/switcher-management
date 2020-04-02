import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-libjava',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Java Client</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" />
    </div>
    <markdown [src]="'${environment.docsUrl}documentation/libjava.md'"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class LibJavaComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
