import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageInputDialogComponent } from './message-input-dialog.component';

describe('MessageInputDialogComponent', () => {
  let component: MessageInputDialogComponent;
  let fixture: ComponentFixture<MessageInputDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MessageInputDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageInputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
