import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigPreviewComponent } from './config-preview.component';

describe('ConfigPreviewComponent', () => {
  let component: ConfigPreviewComponent;
  let fixture: ComponentFixture<ConfigPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
