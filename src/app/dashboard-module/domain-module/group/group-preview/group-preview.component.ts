import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Group } from '../../model/group';
import { Router } from '@angular/router';
import { GroupListComponent } from '../group-list/group-list.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material';

@Component({
  selector: 'app-group-preview',
  templateUrl: './group-preview.component.html',
  styleUrls: ['./group-preview.component.css']
})
export class GroupPreviewComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();
  
  @Input() group: Group;
  @Input() groupListComponent: GroupListComponent;

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
    this.groupListComponent.environmentSelectionChange.pipe(takeUntil(this.unsubscribe)).subscribe(envName => {
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

  getGroupName() {
    return this.group.name;
  }

  getGroup() {
    return this.group;
  }

  selectGroup() {
    this.router.navigate(['/dashboard/domain/group/detail'], { state: { element: JSON.stringify(this.group) } });
  }

  updateStatus(envName: string): void {
    this.classStatus = this.group.activated[envName] ? 'grid-container activated' : 'grid-container deactivated';
    this.classBtnStatus = this.group.activated[envName] ? 'btn-element activated' : 'btn-element deactivated';

    this.environmentStatusSelection.get('environmentStatusSelection').setValue(this.group.activated[envName]);
    this.selectedEnvStatus = this.group.activated[envName];
  }

  changeStatus(event: MatSlideToggleChange) {
    // Invoke API
    // console.log(event.checked);
    // console.log(this.environmentSelection.get('environmentSelection').value);
    this.group.activated[this.environmentStatusSelection.get('environmentStatusSelection').value] = event.checked;
    this.updateStatus(this.environmentStatusSelection.get('environmentStatusSelection').value);
  }

}
