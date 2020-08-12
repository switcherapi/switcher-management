import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings.routing';
import { SettingsComponent } from './settings/settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppMaterialModule } from '../shared/app-material.module';
import { ToasterModule } from '../_helpers/toaster/toaster.module';

@NgModule({
  declarations: [
    SettingsComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    AppMaterialModule,
    SettingsRoutingModule,
    ToasterModule
  ]
})
export class SettingsModule { }
