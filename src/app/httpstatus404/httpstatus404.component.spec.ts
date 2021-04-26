import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Httpstatus404Component } from './httpstatus404.component';

describe('Httpstatus404Component', () => {
  let component: Httpstatus404Component;
  let fixture: ComponentFixture<Httpstatus404Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Httpstatus404Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Httpstatus404Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
