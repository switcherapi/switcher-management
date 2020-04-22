import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricFilterComponent } from './metric-filter.component';

describe('MetricFilterComponent', () => {
  let component: MetricFilterComponent;
  let fixture: ComponentFixture<MetricFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetricFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
