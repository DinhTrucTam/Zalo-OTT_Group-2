import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-contact-dialog',
  templateUrl: './contact-dialog.component.html',
  styleUrls: ['./contact-dialog.component.css']
})
export class ContactDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ContactDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Data passed to the dialog
  ) { }

  /**
   * Closes the dialog and sends the selected contact back.
   * @param contact The selected contact
   */
  selectContact(contact: any): void {
    this.dialogRef.close(contact);
  }

  /**
   * Closes the dialog without making a selection.
   */
  closeDialog(): void {
    this.dialogRef.close();
  }
}
