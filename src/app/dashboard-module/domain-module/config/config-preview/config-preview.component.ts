import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Config } from 'protractor';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ConfigListComponent } from '../config-list/config-list.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { MatSlideToggleChange } from '@angular/material';

@Component({
  selector: 'app-config-preview',
  templateUrl: './config-preview.component.html',
  styleUrls: ['./config-preview.component.css']
})
export class ConfigPreviewComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @Input() config: Config;
  @Input() configListComponent: ConfigListComponent;

  environmentStatusSelection: FormGroup;
  selectedEnvStatus: boolean;

  classStatus: string;
  classBtnStatus: string;

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.loadOperationSelectionComponent();
    this.configListComponent.environmentSelectionChange.pipe(takeUntil(this.unsubscribe)).subscribe(envName => {
      this.updateStatus(envName);
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadOperationSelectionComponent(): void {
    this.environmentStatusSelection = this.fb.group({
      environmentStatusSelection: [null, Validators.required]
    });
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

  updateStatus(envName: string): void {
    const status = this.config.activated[envName] == undefined ? this.config.activated['default'] : this.config.activated[envName];

    this.classStatus = status ? 'grid-container activated' : 'grid-container deactivated';
    this.classBtnStatus = status ? 'btn-element activated' : 'btn-element deactivated';

    this.environmentStatusSelection.get('environmentStatusSelection').setValue(status);
    this.selectedEnvStatus = status;
  }

  changeStatus(event: MatSlideToggleChange) {
    // Invoke API
    // console.log(event.checked);
    // console.log(this.environmentSelection.get('environmentSelection').value);
    this.config.activated[this.environmentStatusSelection.get('environmentStatusSelection').value] = event.checked;
    this.updateStatus(this.environmentStatusSelection.get('environmentStatusSelection').value);
  }

}
