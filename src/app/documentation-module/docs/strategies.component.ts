import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-strategies',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Strategies</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" />
    </div>
    <markdown [src]="'${environment.docsUrl}documentation/strategies.md'"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class StrategiesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
