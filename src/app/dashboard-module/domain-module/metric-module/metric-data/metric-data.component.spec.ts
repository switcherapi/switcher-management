import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricDataComponent } from './metric-data.component';

describe('MetricDataComponent', () => {
  let component: MetricDataComponent;
  let fixture: ComponentFixture<MetricDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetricDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
