import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DomainPreviewComponent } from './domain-preview.component';

describe('DomainPreviewComponent', () => {
  let component: DomainPreviewComponent;
  let fixture: ComponentFixture<DomainPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DomainPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DomainPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
