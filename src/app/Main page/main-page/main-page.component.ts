import { Component, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Define User and Conversation interfaces
interface User {
  id: number;
  userName: string;
}

interface Message {
  sender: string;
  message: string | SafeHtml; // Allow both plain text and sanitized HTML content
}

interface Conversations {
  [key: number]: Message[]; // This allows us to use user.id as the key
}

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
  isMenuVisible: boolean = false; // To track the visibility of the menu

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible; // Toggle menu visibility
  }

  // Define a variable to control the displayed content
  activeViewMiddlePane: string = 'conversations'; // Default view is conversations
  activeViewRightPane: string = ''; // 

  // Function to set the active view
  setActiveViewMiddlePane(view: string): void {
    this.activeViewMiddlePane = view;
  }

  // Function to set the active view
  setActiveViewRightPane(view: string): void {
    this.activeViewRightPane = view;
  }

  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('documentInput') documentInput!: ElementRef<HTMLInputElement>;

  selectedUser: User | null = null;  // Use User type or null
  messageText: string = '';

  // Sample list of users and their conversations
  users1: User[] = [
    { id: 1, userName: 'John Doe' },
    { id: 2, userName: 'Jane Smith' },
    { id: 3, userName: 'Michael Brown' },
    { id: 4, userName: 'Sarah Lee' }
  ];

  contactBox = ["Danh sách bạn bè", "Danh sách nhóm"]

  filteredUsers: User[] = [...this.users1]; // Initialize filteredUsers to be the same as users initially

  // Sample conversations using the Conversations interface
  conversations: Conversations = {
    1: [{ sender: 'John Doe', message: 'Hello! How are you?' }, { sender: 'You', message: 'I’m good, thanks!' }],
    2: [{ sender: 'Jane Smith', message: 'Are you available for a meeting?' }, { sender: 'You', message: 'Sure, when?' }],
    3: [{ sender: 'Michael Brown', message: 'Good morning!' }, { sender: 'You', message: 'Morning!' }],
    4: [{ sender: 'Sarah Lee', message: 'Let’s catch up soon!' }, { sender: 'You', message: 'Absolutely!' }]
  };

  constructor(private sanitizer: DomSanitizer) { }

  // Function to select a user and display the conversation
  selectUser(user: User): void {
    this.selectedUser = user;
  }

  getSelectedUserConversation(): Message[] {
    return this.selectedUser ? this.conversations[this.selectedUser.id] : [];
  }

  // Trigger file input for specific type
  triggerFileInput(type: string): void {
    if (type === 'image') this.imageInput.nativeElement.click();
    if (type === 'video') this.videoInput.nativeElement.click();
    if (type === 'document') this.documentInput.nativeElement.click();
  }

  // Function to filter users based on the search input
  filterUsers(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredUsers = this.users1.filter(user1 =>
      user1.userName.toLowerCase().includes(searchTerm)
    );
  }

  handleFileInput(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (!this.selectedUser) {
      console.error('No user is selected');
      return;
    }

    const selectedUser = this.selectedUser; // Narrow the type

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const fileContent = reader.result;

        let messageContent: SafeHtml | string = '';

        if (type === 'image') {
          messageContent = this.sanitizer.bypassSecurityTrustHtml(
            `<img src="${fileContent}" alt="Image" style="max-width: 200px; cursor: pointer;" (click)="openFullscreen('${fileContent}')">`
          );
        } else if (type === 'video') {
          messageContent = this.sanitizer.bypassSecurityTrustHtml(
            `<video controls style="max-width: 200px;">
            <source src="${fileContent}" type="${file.type}">
            Your browser does not support the video tag.
          </video>`
          );
        } else if (type === 'document') {
          messageContent = this.sanitizer.bypassSecurityTrustHtml(
            `<a href="${fileContent}" download="${file.name}">Download ${file.name}</a>`
          );
        }

        this.conversations[selectedUser.id].push({
          sender: 'You',
          message: messageContent
        });
      };

      reader.readAsDataURL(file);
    }

    input.value = ''; // Clear the input field
  }

  // Change message to string instead of String
  isImage(message: string | SafeHtml): boolean {
    const messageStr = typeof message === 'string' ? message : message.toString();
    return /\.(jpg|jpeg|png|gif)$/i.test(messageStr);
  }

  // Change message to string instead of String
  getImageSrc(message: string | SafeHtml): string {
    const messageStr = typeof message === 'string' ? message : message.toString();
    return messageStr;
  }

  onClick(): void { }

  sendMessage(): void {
    if (this.selectedUser && this.messageText) {
      this.conversations[this.selectedUser.id].push({
        sender: 'You',
        message: this.messageText
      });
      this.messageText = ''; // Clear the input field
    } else if (!this.selectedUser) {
      console.error("No user selected to send a message to.");
    }
  }

}
