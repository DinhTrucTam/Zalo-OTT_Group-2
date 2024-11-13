import { Component } from '@angular/core';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'] // Corrected styleUrls
})
export class MainPageComponent {
  showFiller = false;
  selectedConversation: any = null;  // Initially null

  // Sample conversation list (you can modify or fetch this data from a service)
  conversations = [
    { id: 1, userName: 'John Doe', lastMessage: 'Hello, how are you?' },
    { id: 2, userName: 'Jane Smith', lastMessage: 'Hi! What’s up?' },
    { id: 3, userName: 'Michael Brown', lastMessage: 'Good morning!' },
    { id: 4, userName: 'Sarah Lee', lastMessage: 'Let’s meet later.' }
  ];

  // Function to select a conversation
  selectConversation(conversation: any) {
    this.selectedConversation = conversation;
  }

  // Optional: Reset the selected conversation (could be used for back functionality)
  resetConversation() {
    this.selectedConversation = null;
  }

  // Function to handle general clicks
  onClick() {
    // You can implement any additional logic here when the user clicks on something
  }
}
