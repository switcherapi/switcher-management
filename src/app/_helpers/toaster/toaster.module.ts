import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastsContainerComponent } from '../toasts-container.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    ToastsContainerComponent
  ],
  imports: [
    CommonModule,
    NgbModule
  ],
  exports: [
    ToastsContainerComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ToasterModule { }
