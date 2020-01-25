import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyCloneComponent } from './strategy-clone.component';

describe('StrategyCloneComponent', () => {
  let component: StrategyCloneComponent;
  let fixture: ComponentFixture<StrategyCloneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrategyCloneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyCloneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
