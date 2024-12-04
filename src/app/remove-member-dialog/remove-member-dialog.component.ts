import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-remove-member-dialog',
  templateUrl: './remove-member-dialog.component.html',
  styleUrl: './remove-member-dialog.component.css'
})
export class RemoveMemberDialogComponent {
  selectedParticipantId: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<RemoveMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { participants: any[] }
  ) { }

  selectParticipant(userId: number): void {
    this.selectedParticipantId = userId;
  }

  confirmSelection(): void {
    this.dialogRef.close(this.selectedParticipantId);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
