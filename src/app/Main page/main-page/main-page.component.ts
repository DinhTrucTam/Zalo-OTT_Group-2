import { Component } from '@angular/core';

// Define User and Conversation interfaces
interface User {
  id: number;
  userName: string;
}

interface Message {
  sender: string;
  message: string;
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
  selectedUser: User | null = null;  // Use User type or null
  messageText: string = '';

  // Sample list of users and their conversations
  users1: User[] = [
    { id: 1, userName: 'John Doe' },
    { id: 2, userName: 'Jane Smith' },
    { id: 3, userName: 'Michael Brown' },
    { id: 4, userName: 'Sarah Lee' }
  ];

  filteredUsers: User[] = [...this.users1]; // Initialize filteredUsers to be the same as users initially

  // Sample conversations using the Conversations interface
  conversations: Conversations = {
    1: [{ sender: 'John Doe', message: 'Hello! How are you?' }, { sender: 'You', message: 'I’m good, thanks!' }],
    2: [{ sender: 'Jane Smith', message: 'Are you available for a meeting?' }, { sender: 'You', message: 'Sure, when?' }],
    3: [{ sender: 'Michael Brown', message: 'Good morning!' }, { sender: 'You', message: 'Morning!' }],
    4: [{ sender: 'Sarah Lee', message: 'Let’s catch up soon!' }, { sender: 'You', message: 'Absolutely!' }]
  };

  // Function to select a user and display the conversation
  selectUser(user: User): void {
    this.selectedUser = user;
  }

  getSelectedUserConversation(): Message[] {
    return this.selectedUser ? this.conversations[this.selectedUser.id] : [];
  }

  // Function to filter users based on the search input
  filterUsers(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredUsers = this.users1.filter(user1 =>
      user1.userName.toLowerCase().includes(searchTerm)
    );
  }

  onClick(): void { }

  // Function to send a message
  sendMessage(): void {
    if (this.selectedUser && this.messageText) {
      this.conversations[this.selectedUser.id].push({
        sender: 'You',
        message: this.messageText
      });
      this.messageText = ''; // Clear the input field after sending
    }
  }
}
