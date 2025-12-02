import { Component, inject, input, computed } from '@angular/core';
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

  classStatus = computed(() => 
    this.domain().activated['default'] ? 'grid-container activated' : 'grid-container deactivated'
  );
  
  classBtnStatus = computed(() => 
    this.domain().activated['default'] ? 'header-section activated' : 'header-section deactivated'
  );

  selectDomain() {
    const domainValue = this.domain();
    this.router.navigate([`/dashboard/domain/${encodeURIComponent(domainValue.name)}/${domainValue.id}`], 
      { state: { element: JSON.stringify(domainValue) } });
  }

}
