import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConversationService } from './Services/conversation.service';
import { SearchingService } from './Services/searching.service';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FileUploadService } from './Services/sendingvideo_image_doc.service';
import { AvatarService } from './Services/avatar.service';
import { GroupCreationService } from './Services/groupcreation.service';

// Define User and Conversation interfaces
interface User {
  id: number;
  userName: string;
}

interface Message {
  senderId: number;
  content: string | SafeHtml; // Allow both plain text and sanitized HTML content
  conversationId: number;
  contentType: string
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
  private socket$!: WebSocketSubject<any>; // WebSocket for real-time messaging

  //constructor//
  constructor(private sanitizer: DomSanitizer,
    private conversationfetching: ConversationService,
    private searchingService: SearchingService,
    private router: Router,
    private toastr: ToastrService,
    private fileUploadService: FileUploadService,
    private avatarService: AvatarService,
    private groupCreationService: GroupCreationService) { }

  //parameters//
  isMenuVisible: boolean = false; // To track the visibility of the menu
  activeView: string = 'conversations'; // Default view is conversations
  selectedUser: User | null = null;  // Use User type or null
  messageText: string = '';
  conversationsList: any[] = []; // To hold conversations data
  currentUserId: any;
  currentUserName: string = 'Unknown User'; // Default name
  currentUserPhoto: string = 'assets/default-profile.png'; // Default profile image
  searchInput: string = ''; // Holds the entered phone number
  searchResults: any[] = []; // Stores the API results
  conversations: Conversations = {};
  users1: User[] = [];
  contactBox = ["Danh sách bạn bè", "Danh sách nhóm"]
  filteredUsers: User[] = [...this.users1]; // Initialize filteredUsers to be the same as users initially
  contacts: any[] = []; // List of all contacts
  selectedMembers: any[] = []; // Selected members for the group

  //this function is called whenever the main page is reloaded/accessed
  ngOnInit(): void {
    // Retrieve the current user ID from Local Storage
    this.searchInput = ''; // Holds the entered phone number
    this.searchResults = []; // Stores the API results
    const storedUserId = localStorage.getItem('userId');
    this.currentUserId = storedUserId ? parseInt(storedUserId) : null;
    this.fetchConversations();
    this.setupWebSocket();

    // Fetch conversations every 1 seconds (not recommended, for demo only)
    // setInterval(() => {
    //   this.fetchConversations();
    // }, 1000);
  }

  setupWebSocket(): void {
    //Initialize WebSocket
    this.socket$ = new WebSocketSubject({
      url: 'ws://128.199.91.226:8082/text',
      deserializer: (msg) => {
        try {
          return JSON.parse(msg.data);
        } catch (error) {
          console.warn('Non-JSON message received:', msg.data);
          return msg.data; // Return raw data if not JSON
        }
      },
    });

    //Inform the server that a session from the current user is opened
    const initSessionMessage = {
      contentType: 'INIT_SESSION',
      senderId: this.currentUserId
    };
    this.socket$.next(initSessionMessage);

    //Listen to the server's response
    this.socket$.subscribe({
      next: (msg) => {
        console.log('Incoming message:', msg);
        this.fetchConversations(); // Update conversations
      },
      error: (err) => {
        console.error('WebSocket error:', err);
        // Reconnect after an error
        setTimeout(() => this.setupWebSocket(), 3000);
      },
      complete: () => {
        console.log('WebSocket connection closed');
        // Optionally, reconnect on close
        setTimeout(() => this.setupWebSocket(), 3000);
      },
    });
  }

  closeWebSocket(): void {
    if (this.socket$) {
      this.socket$.complete(); // Close the WebSocket connection
    }
  }

  // Handle incoming WebSocket messages
  handleIncomingMessage(message: any): void {
    console.log('Incoming WebSocket message:', message);
  }

  //Fetch the conversations
  fetchConversations(): void {
    const participantUserId = this.currentUserId; // Replace with the actual user ID
    this.conversationfetching.fetchConversations(participantUserId).subscribe(
      (response) => {
        console.log('Conversations fetched successfully:', response);
        //get the conversationsList
        this.conversationsList = response.content;

        console.log(this.conversationsList);

        // Extract unique contacts from the conversations
        this.extractContacts();


        // Find the current user's data from the conversations
        this.setCurrentUserInfo();
      },
      (error) => {
        console.error('Error fetching conversations:', error);
      }
    );
  }

  //Retrieve contacts by searching phone number
  searchContactByPhone(): void {
    // Remove any whitespace from the input
    this.searchInput = this.searchInput.trim();
    if (!this.searchInput) {
      alert('Vui lòng nhập số điện thoại hoặc tên để tìm kiếm.');
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Authentication token missing. Please log in again.');
      return;
    }
    // If the input is a valid 10-digit phone number, search by phone
    if (this.searchInput.length === 10 && /^\d+$/.test(this.searchInput)) {
      const payload = {
        participantUserId: this.currentUserId, // Current user ID
        phone: this.searchInput,
        privateChat: true,
      };
      this.searchingService.searchContact(payload, token).subscribe({
        next: (response: any) => {
          console.log('Search successful:', response);

          const participants = response?.content[0]?.participants || [];
          this.searchResults = participants.map((p: any) => ({
            userId: p.userId,
            participantName: p.participantName,
            profilePhoto: p.profilePhoto || 'assets/default-profile.png'
          }));
        },
        error: (error) => {
          console.error('Error fetching contact:', error);
          alert('Không tìm thấy thông tin liên lạc. Vui lòng thử lại.');
        }
      });
      return;
    }
  }

  //Retrieve contacts by searching name
  // Retrieve contacts by searching name in private chats
  searchContactByName(searchTerm: string): void {
    // Filter conversations where privateChat is true
    const matchingConversations = this.conversationsList.filter(conversation =>
      conversation.privateChat &&
      conversation.participants.some((participant: any) =>
        participant.participantName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (matchingConversations.length === 0) {
      alert('Không tìm thấy thông tin liên lạc. Vui lòng thử lại.');
    } else {
      // Extract the participants that match the name
      const matchedUsers = matchingConversations.flatMap(conversation =>
        conversation.participants.filter((participant: any) =>
          participant.participantName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

      // Map the matched users to display data
      this.searchResults = matchedUsers.map((participant: any) => ({
        userId: participant.userId,
        participantName: participant.participantName,
        profilePhoto: participant.profilePhoto || 'assets/default-profile.png'
      }));

      console.log('Search by name in private chats results:', this.searchResults);
    }
  }

  //Decide which types of searching (phone or name)
  onSearch(): void {
    const searchInput = this.searchInput.trim();
    if (!searchInput) {
      // Handle empty input
      this.searchResults = [];
      return;
    }
    if (/^\d+$/.test(searchInput)) {
      // Input is a phone number (contains only digits)
      this.searchContactByPhone();
    } else {
      // Input is not a phone number, assume it's a name
      this.searchContactByName(searchInput);
    }
  }

  onUserSelected(selectedUser: any): void {
    if (!selectedUser) return;
    const userId = selectedUser.userId;
    // Filter conversations that include the selected user
    const matchingConversations = this.conversationsList.filter(conversation =>
      conversation.participants.some((participant: any) => participant.userId === userId)
    );
    if (matchingConversations.length > 0) {
      this.conversationsList = matchingConversations; // Update the left chat list
      this.setActiveView('conversations'); // Switch to the conversations view if not already
    } else {
      alert('No conversations found with this user.');
    }
  }

  //Click on "Tất cả", and fetch again all conversations
  resetView(): void {
    this.ngOnInit();
  }

  setCurrentUserInfo(): void {
    if (!this.conversationsList || !this.currentUserId) return;
    // Iterate over participants in all conversations to find current user
    for (const conversation of this.conversationsList) {
      const currentUser = conversation.participants.find((p: any) => p.userId === this.currentUserId);
      if (currentUser) {
        this.currentUserName = currentUser.participantName || 'Unknown User';
        this.currentUserPhoto = currentUser.profilePhoto || 'assets/default-profile.png';
        break;
      }
    }
  }

  getParticipantNames(conversation: any): string {
    // Filter out the current user (participant ID = 1) and join other participants' names
    return conversation.participants
      .filter((participant: any) => participant.userId !== 1)
      .map((participant: any) => participant.participantName)
      .join(', ');
  }

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible; // Toggle menu visibility
  }

  // Function to set the active view
  setActiveView(view: string): void {
    this.activeView = view;
  }

  // Function to select a user and display the conversation
  selectUser(user: User): void {
    this.selectedUser = user;
  }

  getSelectedUserConversation(): Message[] {
    return this.selectedUser ? this.conversations[this.selectedUser.id] : [];
  }


  // Handling images/video/docs
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('documentInput') documentInput!: ElementRef<HTMLInputElement>;

  // Trigger file input based on type
  triggerFileInput(type: string): void {
    if (type === 'image') {
      this.imageInput?.nativeElement.click();
    } else if (type === 'video') {
      this.videoInput?.nativeElement.click();
    } else if (type === 'document') {
      this.documentInput?.nativeElement.click();
    } else {
      console.error('Unsupported file input type:', type);
    }
  }

  // Function to filter users based on the search input
  filterUsers(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredUsers = this.users1.filter(user1 =>
      user1.userName.toLowerCase().includes(searchTerm)
    );
  }

  //handleFileInput(event: Event, type: string): void {
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
  //}
  // Function to handle file input
  // handleFileInput(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (!input.files || input.files.length === 0) {
  //     console.error('No file selected');
  //     return;
  //   }

  //   const file = input.files[0];
  //   const fileType = file.type.startsWith('image/') ? 'IMAGE' : 'UNKNOWN';
  //   const fileExtension = file.name.split('.').pop() || 'unknown';

  //   // Call the upload service
  //   this.fileUploadService.uploadFile(file, fileType, fileExtension).subscribe({
  //     next: (response: any) => {
  //       console.log('Upload response:', response);
  //       alert(`File uploaded successfully: ${response.link}`);


  //       const newMessage = {
  //         content: response.link,
  //         contentType: 'IMAGE',
  //         conversationId: this.selectedUser.id,
  //         senderId: this.currentUserId,
  //       };

  //       try {
  //         this.socket$.next(newMessage); // Send the message
  //         console.log('Message sent:', newMessage);

  //         // Clear input field
  //         this.messageText = '';
  //       } catch (err) {
  //         console.error('Error sending message:', err);
  //         //this.setupWebSocket(); // Attempt to reconnect
  //       }

  //     },
  //     error: (err) => {
  //       console.error('Upload failed:', err);
  //       alert('Failed to upload file. Please try again.');
  //     }
  //   });

  //   // Reset the file input
  //   input.value = '';
  // }

  // handleFileInput(event: Event, inputType: any): void {
  //   const input = event.target as HTMLInputElement;
  //   if (!input.files || input.files.length === 0) {
  //     console.error('No file selected');
  //     return;
  //   }
  //   const file = input.files[0];
  //   const fileType = file.type.startsWith('image/') ? 'IMAGE' : 'UNKNOWN';
  //   const fileExtension = file.name.split('.').pop() || 'unknown';
  //   console.log(fileExtension);
  //   // Ensure a user is selected
  //   if (!this.selectedUser) {
  //     alert('No user selected. Please select a user to send the image.');
  //     return;
  //   }
  //   // Call the upload service
  //   this.fileUploadService.uploadFile(file, fileType, fileExtension).subscribe({
  //     next: (response: any) => {
  //       console.log('Upload response:', response);
  //       alert(`File uploaded successfully: ${response.link}`);

  //       // send image URL via websocket
  //       const newMessage = {
  //         content: response.link,
  //         contentType: 'IMAGE',
  //         conversationId: this.selectedUser!.id, // Non-null assertion because we've checked earlier
  //         senderId: this.currentUserId,
  //       };

  //       try {
  //         this.socket$.next(newMessage); // Send the message
  //         console.log('Message sent:', newMessage);
  //       } catch (err) {
  //         console.error('Error sending message:', err);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Upload failed:', err);
  //       alert('Failed to upload file. Please try again.');
  //     }
  //   });

  //   // Reset the file input
  //   input.value = '';
  // }

  // Handle file input changes
  handleFileInput(event: Event, inputType: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      console.error('No file selected');
      return;
    }

    const file = input.files[0];
    const fileExtension = file.name.split('.').pop() || 'unknown';
    console.log(file, fileExtension);
    let contentType: string;

    // Determine content type
    switch (inputType.toLowerCase()) {
      case 'image':
        contentType = 'IMAGE';
        break;
      case 'video':
        contentType = 'VIDEO';
        break;
      case 'document':
        contentType = 'DOCUMENT';
        break;
      default:
        console.error('Unsupported file type:', inputType);
        return;
    }

    // Ensure a user is selected
    if (!this.selectedUser) {
      alert('No user selected. Please select a user to send the file.');
      return;
    }

    // Call the upload service
    this.fileUploadService.uploadFile(file, contentType, fileExtension).subscribe({
      next: (response: any) => {
        console.log('Upload response:', response);

        // Notify user and create the message
        this.toastr.success('Tệp được tải lên thành công!', 'Success');
        const newMessage = {
          content: response.link,
          contentType,
          conversationId: this.selectedUser!.id,
          senderId: this.currentUserId,
        };

        // Send the message via WebSocket
        try {
          this.socket$.next(newMessage);
          console.log('Message sent:', newMessage);
        } catch (err) {
          console.error('Error sending message:', err);
        }
      },
      error: (err) => {
        console.error('Upload failed:', err);
        alert('Tải lên tệp thất bại.');
        this.toastr.error('Tải lên tệp thất bại.', 'error');
      }
    });

    // Reset the file input
    input.value = '';
  }

  handleAvatarUpdate(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      console.error('No file selected');
      return;
    }

    const file = input.files[0];
    const fileExtension = file.name.split('.').pop() || 'unknown';

    if ((fileExtension == 'png') || (fileExtension == 'jpg') || (fileExtension == 'PNG') || (fileExtension == 'JPG')) {
      this.avatarService.updateAvatar(file, this.currentUserId, fileExtension).subscribe({
        next: (response: any) => {
          console.log('Avatar updated successfully:', response);
          this.currentUserPhoto = response.link; // Update the avatar on the UI
          this.toastr.success('Cập nhật ảnh đại diện thành công!', 'Success');
        },
        error: (err) => {
          console.error('Error updating avatar:', err);
          alert('Câp nhật ảnh đại diện thất bại. Xin hãy thử lại.');
        }
      });
    }
    else {
      this.toastr.error('File ảnh không đúng định dạng (.png) hoặc (.JPG)', 'Error');
    }

    // Reset file input
    input.value = '';
  }

  isImage(message: string | SafeHtml): boolean {
    const messageStr = typeof message === 'string' ? message : message.toString();
    return /\.(jpg|jpeg|png|gif)$/i.test(messageStr);
  }

  getImageSrc(message: string | SafeHtml): string {
    const messageStr = typeof message === 'string' ? message : message.toString();
    return messageStr;
  }

  isVideo(message: string | SafeHtml): boolean {
    const messageStr = typeof message === 'string' ? message : message.toString();
    return /\.(mp4|mkv|webm|mov)$/i.test(messageStr);
  }

  getVideoSrc(message: string | SafeHtml): string {
    const messageStr = typeof message === 'string' ? message : message.toString();
    return messageStr;
  }

  isValidUrl(content: string | SafeHtml): boolean {
    const contentStr = typeof content === 'string' ? content : content.toString();
    try {
      const url = new URL(contentStr);
      return !!url; // Returns true if valid URL
    } catch {
      return false; // Returns false if invalid URL
    }
  }

  onClick(): void { }

  getConversationMessages(): any[] {
    if (!this.selectedUser || !this.conversationsList) return [];
    // Find the selected conversation by matching the user ID
    const conversation = this.conversationsList.find(c => c.id === this.selectedUser?.id);
    // Return the messages for the conversation or an empty array
    return conversation?.chatMessages || [];
  }

  sendMessage(): void {
    if (!this.selectedUser || !this.messageText.trim()) {
      console.error('No user selected or message is empty.');
      return;
    }

    if (!this.socket$) {
      console.error('WebSocket is not connected.');
      this.setupWebSocket(); // Attempt to reconnect
      return;
    }

    const newMessage = {
      content: this.messageText.trim(),
      contentType: 'TEXT',
      conversationId: this.selectedUser.id,
      senderId: this.currentUserId,
    };

    try {
      this.socket$.next(newMessage); // Send the message
      console.log('Message sent:', newMessage);
      this.fetchConversations();
      // Clear input field
      this.messageText = '';
    } catch (err) {
      console.error('Error sending message:', err);
      //this.setupWebSocket(); // Attempt to reconnect
    }
  }

  logOut(): void {
    // Clear all data in local storage
    localStorage.clear();

    this.toastr.success('Đăng xuất thành công', 'Success');

    // Navigate to the login page (or another page)
    this.router.navigate(['/login']);
  }

  isMemberSelected(participantId: number): boolean {
    return this.selectedMembers.some(member => member.userId === participantId);
  }

  extractContacts(): void {
    // Create a Set to track unique userIds
    const contactMap = new Map<number, any>();

    this.conversationsList.forEach((conversation) => {
      conversation.participants.forEach((participant: any) => {
        if (participant.userId !== this.currentUserId && !contactMap.has(participant.userId)) {
          // Add participant to the contacts list if not already added
          contactMap.set(participant.userId, participant);
        }
      });
    });

    // Convert Map values to an array to get the unique contacts
    this.contacts = Array.from(contactMap.values());
    console.log('Extracted Contacts:', this.contacts);
  }

  toggleMemberSelection(participant: any): void {
    if (this.isMemberSelected(participant.userId)) {
      this.removeFromGroup(participant.userId);
    } else {
      this.selectedMembers.push(participant);
    }
  }

  removeFromGroup(participantId: number): void {
    this.selectedMembers = this.selectedMembers.filter(member => member.userId !== participantId);
  }

  createGroup(): void {
    if (this.selectedMembers.length === 0) {
      alert('Please select at least one member to create a group.');
      this.toastr.warning('Chọn ít nhất thêm 1 thành viên để tạo nhóm', 'Warning');
      return;
    }

    const groupPayload = {
      Admin: this.currentUserId,
      participants: this.selectedMembers.map(member => member.userId),
    };

    this.groupCreationService.createGroup(groupPayload.Admin, groupPayload.participants).subscribe(
      (response) => {
        console.log('Group created successfully:', response);
        this.toastr.success('Tạo nhóm thành công!', 'Success');
        this.selectedMembers = []; // Reset selected members
      },
      (error) => {
        console.error('Error creating group:', error);
        this.toastr.error('Tạo nhóm thất bại.', 'error');
      }
    );
    this.fetchConversations();
  }
}