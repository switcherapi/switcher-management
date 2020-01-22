import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastsContainer } from '../toasts-container.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    ToastsContainer
  ],
  imports: [
    CommonModule,
    NgbModule
  ],
  exports: [
    ToastsContainer
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ToasterModule { }
