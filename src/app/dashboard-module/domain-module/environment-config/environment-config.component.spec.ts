import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvironmentConfigComponent } from './environment-config.component';

describe('EnvironmentConfigComponent', () => {
  let component: EnvironmentConfigComponent;
  let fixture: ComponentFixture<EnvironmentConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnvironmentConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvironmentConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
