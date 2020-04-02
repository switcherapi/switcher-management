import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-metrics',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Metrics</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" />
    </div>
    <markdown [src]="'assets/documentation/metrics.md'"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class MetricsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
