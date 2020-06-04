import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupTeamComponent } from './signup-team.component';

describe('SignupTeamComponent', () => {
  let component: SignupTeamComponent;
  let fixture: ComponentFixture<SignupTeamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupTeamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
