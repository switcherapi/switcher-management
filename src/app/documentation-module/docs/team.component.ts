import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-team',
  template: `
    <div class="doc-header">
      <h3 class="doc-title">Team</h3>
      <img src="assets/switcherapi_mark_white.png" class="doc-icon" />
    </div>
    <markdown [src]="'assets/documentation/team.md'"></markdown>
  `,
  styleUrls: ['../documentation/documentation.component.css']
})
export class TeamComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
