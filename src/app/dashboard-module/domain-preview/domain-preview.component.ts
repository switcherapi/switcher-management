import { Component, inject, input, signal, effect } from '@angular/core';
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
export class DomainPreviewComponent {
  private readonly router = inject(Router);

  domain = input.required<Domain>();

  classStatus = signal<string>('grid-container deactivated');
  classBtnStatus = signal<string>('header-section deactivated');

  constructor() {
    // Initialize CSS classes when domain input changes
    effect(() => {
      const domain = this.domain();
      const isActivated = domain.activated['default'];
      this.updateCssClasses(isActivated);
    });
  }

  selectDomain() {
    const domainValue = this.domain();
    this.router.navigate([`/dashboard/domain/${encodeURIComponent(domainValue.name)}/${domainValue.id}`], 
      { state: { element: JSON.stringify(domainValue) } });
  }

  private updateCssClasses(isActivated: boolean): void {
    this.classStatus.set(isActivated ? 'grid-container activated' : 'grid-container deactivated');
    this.classBtnStatus.set(isActivated ? 'header-section activated' : 'header-section deactivated');
  }

}
