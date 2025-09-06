import { Component, OnInit, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Domain } from 'src/app/model/domain';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-domain-preview',
    templateUrl: './domain-preview.component.html',
    styleUrls: [
        '../domain-module/common/css/preview.component.css',
        './domain-preview.component.css'
    ],
    imports: [NgClass]
})
export class DomainPreviewComponent implements OnInit {
  private readonly router = inject(Router);

  @Input() domain: Domain;

  classStatus: string;
  classBtnStatus: string;

  ngOnInit() {
    this.updateStatus();
  }

  selectDomain() {
    this.router.navigate([`/dashboard/domain/${encodeURIComponent(this.domain.name)}/${this.domain.id}`], 
      { state: { element: JSON.stringify(this.domain) } });
  }

  updateStatus(): void {
    this.classStatus = this.domain.activated['default'] ? 'grid-container activated' : 'grid-container deactivated';
    this.classBtnStatus = this.domain.activated['default'] ? 'header-section activated' : 'header-section deactivated';
  }

}
