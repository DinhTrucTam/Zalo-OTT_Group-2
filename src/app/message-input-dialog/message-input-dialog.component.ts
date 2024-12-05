import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GroupCreationService } from '../Main page/main-page/Services/groupcreation.service';

@Component({
  selector: 'app-message-input-dialog',
  templateUrl: './message-input-dialog.component.html',
  styleUrls: ['./message-input-dialog.component.css']
})
export class MessageInputDialogComponent {
  message: string = '';

  constructor(
    public dialogRef: MatDialogRef<MessageInputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,  // Inject data passed from MainPageComponent
    private groupCreationService: GroupCreationService  // Inject the group creation service
  ) { }

  onSend(): void {
    if (this.message.trim()) {
      const currentUserId = this.data.currentUserId;
      const selectedUserId = this.data.selectedUser.userId;

      // Call the GroupCreationService to create the group
      this.groupCreationService.createGroup(currentUserId, [currentUserId, selectedUserId]).subscribe({
        next: (response) => {
          // Optionally send the initial message here or handle it separately
          console.log('Group created successfully:', response);

          // Close the dialog after successful group creation
          this.dialogRef.close(this.message); // Send the message back to the caller
        },
        error: (error) => {
          console.error('Error creating group:', error);
          alert('Failed to create a conversation.');
        }
      });
    } else {
      alert('Please enter a message.');
    }
  }

  onCancel(): void {
    this.dialogRef.close(); // Close without sending a message
  }
}
