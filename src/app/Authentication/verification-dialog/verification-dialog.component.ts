import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-verification-dialog',
  templateUrl: './verification-dialog.component.html',
  styleUrl: './verification-dialog.component.css'
})
export class VerificationDialogComponent {
  verificationCode: string = '';

  constructor(private dialogRef: MatDialogRef<VerificationDialogComponent>) { }

  verifyCode() {
    this.dialogRef.close(this.verificationCode);
  }

  closeDialog() {
    this.dialogRef.close(null);
  }
}