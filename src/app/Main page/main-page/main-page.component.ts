  import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
  import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
  import { HttpClient, HttpHeaders } from '@angular/common/http';
  import { ConversationService } from './Services/conversation.service';

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
  export class MainPageComponent implements OnInit {

    //constructor
    constructor(private sanitizer: DomSanitizer, private http: HttpClient, private conversationfetching: ConversationService) { }


    //params
    isMenuVisible: boolean = false; // To track the visibility of the menu
    activeView: string = 'conversations'; // Default view is conversations
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

    conversationsList: any[] = []; // To hold conversations data
    currentUserId: any;

    ngOnInit(): void {
      // Retrieve the current user ID from Local Storage
      const storedUserId = localStorage.getItem('userId');
      this.currentUserId = storedUserId ? parseInt(storedUserId) : null;
      this.fetchConversations();
    }

    fetchConversations(): void {
      const participantUserId = 1; // Replace with the actual user ID

      this.conversationfetching.fetchConversations(participantUserId).subscribe(
        (response) => {
          console.log('Conversations fetched successfully:', response);

          //get the conversationsList
          this.conversationsList = response.content;
          console.log(this.conversationsList);

          //for each conversation, if private = true then it's a 1-on-1

          //retrieve all participants of each conversation
        },
        (error) => {
          console.error('Error fetching conversations:', error);
        }
      );
    }

    getParticipantNames(conversation: any): string {
      // Filter out the current user (participant ID = 1) and join other participants' names
      return conversation.participants
        .filter((participant: any) => participant.userId !== 1)
        .map((participant: any) => participant.participantName)
        .join(', ');
    }
    
    getConversationMessages(): any[] {
      if (!this.selectedUser || !this.conversationsList) return [];

      // Find the selected conversation by matching the user ID
      const conversation = this.conversationsList.find(c => c.id === this.selectedUser?.id);

      // Return the messages for the conversation or an empty array
      return conversation?.chatMessages || [];
    }


    toggleMenu() {
      this.isMenuVisible = !this.isMenuVisible; // Toggle menu visibility
    }

    // Function to set the active view
    setActiveView(view: string): void {
      this.activeView = view;
    }

    @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
    @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;
    @ViewChild('documentInput') documentInput!: ElementRef<HTMLInputElement>;

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

    // handleFileInput(event: Event, type: string): void {
    //   const input = event.target as HTMLInputElement;
    //   const file = input?.files?.[0];

    //   if (!this.selectedUser) {
    //     console.error('No user is selected');
    //     return;
    //   }

    //   const selectedUser = this.selectedUser; // Narrow the type

    //   if (file) {
    //     const reader = new FileReader();

    //     reader.onload = () => {
    //       const fileContent = reader.result;

    //       let messageContent: SafeHtml | string = '';

    //       if (type === 'image') {
    //         messageContent = this.sanitizer.bypassSecurityTrustHtml(
    //           <img src="${fileContent}" alt = "Image" style = "max-width: 200px; cursor: pointer;"(click) = "openFullscreen('${fileContent}')" >
    //         );
    //       } else if (type === 'video') {
    //         messageContent = this.sanitizer.bypassSecurityTrustHtml(
    //           `<video controls style="max-width: 200px;">
    //           <source src="${fileContent}" type="${file.type}">
    //           Your browser does not support the video tag.
    //         </video>`
    //         );
    //       } else if (type === 'document') {
    //         messageContent = this.sanitizer.bypassSecurityTrustHtml(
    //           <a href="${fileContent}" download = "${file.name}" > Download ${ file.name } < /a>
    //         );
    //       }

    //       this.conversations[selectedUser.id].push({
    //         sender: 'You',
    //         message: messageContent
    //       });
    //     };

    //     reader.readAsDataURL(file);
    //   }

    //   input.value = ''; // Clear the input field
    // }

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