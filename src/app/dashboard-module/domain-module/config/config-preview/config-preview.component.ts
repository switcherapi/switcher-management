import { Component, OnInit, Input } from '@angular/core';
import { Config } from 'protractor';
import { Router } from '@angular/router';

@Component({
  selector: 'app-config-preview',
  templateUrl: './config-preview.component.html',
  styleUrls: ['./config-preview.component.css']
})
export class ConfigPreviewComponent implements OnInit {
  @Input() config: Config;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  getConfigName() {
    return this.config.name;
  }

  getConfig() {
    return this.config;
  }

  selectConfig() {
    this.router.navigate(['/dashboard/domain/group/switcher/detail'], { state: { element: JSON.stringify(this.config) } });
  }

}
