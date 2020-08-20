import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings.routing';
import { SettingsComponent } from './settings/settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppMaterialModule } from '../shared/app-material.module';
import { ToasterModule } from '../_helpers/toaster/toaster.module';
import { SettingsAccountComponent } from './settings-account/settings-account.component';
import { BlockUIModule } from 'ng-block-ui';

@NgModule({
  declarations: [
    SettingsComponent,
    SettingsAccountComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    AppMaterialModule,
    SettingsRoutingModule,
    ToasterModule,
    BlockUIModule.forRoot()
  ]
})
export class SettingsModule { }
