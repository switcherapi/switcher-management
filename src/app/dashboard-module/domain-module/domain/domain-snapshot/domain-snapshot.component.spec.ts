import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DomainSnapshotComponent } from './domain-snapshot.component';

describe('DomainSnapshotComponent', () => {
  let component: DomainSnapshotComponent;
  let fixture: ComponentFixture<DomainSnapshotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DomainSnapshotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DomainSnapshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
