import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyCreateComponent } from './strategy-create.component';

describe('StrategyCreateComponent', () => {
  let component: StrategyCreateComponent;
  let fixture: ComponentFixture<StrategyCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
