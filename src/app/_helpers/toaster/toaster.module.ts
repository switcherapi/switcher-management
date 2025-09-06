import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastsContainerComponent } from '../toasts-container.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        ToastsContainerComponent
    ],
    exports: [
        ToastsContainerComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ToasterModule { }
