import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricStatisticsComponent } from './metric-statistics.component';

describe('MetricStatisticsComponent', () => {
  let component: MetricStatisticsComponent;
  let fixture: ComponentFixture<MetricStatisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetricStatisticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
