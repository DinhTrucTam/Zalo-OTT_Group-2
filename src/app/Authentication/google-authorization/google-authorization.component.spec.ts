import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleAuthorizationComponent } from './google-authorization.component';

describe('GoogleAuthorizationComponent', () => {
  let component: GoogleAuthorizationComponent;
  let fixture: ComponentFixture<GoogleAuthorizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GoogleAuthorizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleAuthorizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
