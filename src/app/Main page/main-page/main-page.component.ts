import { Component, ViewChild, ElementRef, OnInit, AfterViewChecked } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConversationService } from './Services/conversation.service';
import { SearchingService } from './Services/searching.service';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FileUploadService } from './Services/sendingvideo_image_doc.service';
import { AvatarService } from './Services/avatar.service';
import { GroupCreationService } from './Services/groupcreation.service';
import { AddMemberService } from './Services/addmember.service';
import { MatDialog } from '@angular/material/dialog';
import { ContactDialogComponent } from '../../contact-dialog/contact-dialog.component';
import { RemoveMemberService } from './Services/removemember.service';
import { RemoveMemberDialogComponent } from '../../remove-member-dialog/remove-member-dialog.component';
import { MessageInputDialogComponent } from '../../message-input-dialog/message-input-dialog.component';
import { RemoveConversationService } from './Services/removeconversation.service';

// Define User and Conversation interfaces
interface User {
  id: number;
  userName: string;
  photo?: string;  // Optional photo property
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

export class MainPageComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer: ElementRef | undefined;
  private socket$!: WebSocketSubject<any>; // WebSocket for real-time messaging

  //constructor//
  constructor(private sanitizer: DomSanitizer,
    private conversationfetching: ConversationService,
    private searchingService: SearchingService,
    private router: Router,
    private toastr: ToastrService,
    private fileUploadService: FileUploadService,
    private avatarService: AvatarService,
    private groupCreationService: GroupCreationService,
    private dialog: MatDialog,
    private addMemberService: AddMemberService,
    private removeMemberService: RemoveMemberService,
    private removeConversationService: RemoveConversationService) { }

  //parameters//
  isMenuVisible: boolean = false; // To track the visibility of the menu
  activeView: string = 'conversations'; // Default view is conversations
  selectedContent: string = '';     // Holds the selected content for right panel
  selectedUser: User | null = null;  // Use User type or null
  messageText: string = '';
  conversationsList: any[] = []; // To hold conversations data
  currentUserId: any;
  currentUserName: string = 'Unknown User'; // Default name
  defaultUserProfleImage: string = 'assets/user.png'; // Default profile image
  currentUserPhoto: string = this.defaultUserProfleImage; // Default profile image
  defaultGroupProfileImage = 'assets/team.png';
  defaultFriendsListImage = 'assets/friends_list.png';
  defaultGroupsListImage = 'assets/groups_list.png';
  searchInput: string = ''; // Holds the entered phone number
  searchResults: any[] = []; // Stores the API results
  conversations: Conversations = {};
  users1: User[] = [];
  contactBox = ["Danh sách bạn bè", "Danh sách nhóm"]
  filteredUsers: User[] = [...this.users1]; // Initialize filteredUsers to be the same as users initially
  contacts: any[] = []; // List of all contacts
  selectedMembers: any[] = []; // Selected members for the group
  currentConversationId: any;
  filteredContacts: any[] = [];
  filteredGroups: any[] = [];
  removeConversationDialogOpen = false; // Flag to track dialog state
  currentUserPhone: string = '';  // User's phone number
  currentUserEmail: string = '';  // User's email
  currentUserBirthdate: string = '';  // User's birthdate
  showProfileEdit: boolean = false;  // Toggle for showing profile edit form

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

  ngAfterViewChecked(): void {
    // Scroll to the bottom when the view is updated with new messages
    if (this.chatContainer) {
      const container = this.chatContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  // Function to set the active view
  setActiveView(view: string): void {
    this.activeView = view;
  }

  // Set the selected content when a contact is clicked
  setActiveContent(content: string) {
    this.selectedContent = content;
    if (this.selectedContent == "Danh sách bạn bè") {
      this.filterContacts();
    }
    else {
      this.filterGroups();
    }
  }

  setupWebSocket(): void {
    //Initialize WebSocket
    this.socket$ = new WebSocketSubject({
      url: 'ws://157.245.156.156:8082/text',
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
        setTimeout(() => this.setupWebSocket(), 60000);
      },
      complete: () => {
        console.log('WebSocket connection closed');
        // Optionally, reconnect on close
        //setTimeout(() => this.setupWebSocket(), 3000);
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

  // Filter contacts to only include participantName and profilePhoto
  filterContacts(): void {
    this.filteredContacts = this.contacts.map(contact => ({
      name: contact.participantName,
      profilePhoto: contact.profilePhoto || this.defaultUserProfleImage // Default image if no profile photo
    }));
  }

  // Filter groups to only include participantName and profilePhoto
  filterGroups(): void {
    // Filter out conversations where privateChat is false
    this.filteredGroups = this.conversationsList
      .filter(conversation => conversation.privateChat === false)
      .map(conversation => {
        // Get all participants' names
        const groupNames = conversation.participants.map((participant: any) => participant.participantName).join(', ') || 'No Participants Available';
        // Get the profile image of the first participant, or use the default
        const groupProfileImage = this.defaultGroupProfileImage;

        return {
          groupNames,         // All participant names as a string, separated by commas
          groupProfileImage   // Profile image of the first participant or default
        };
      });
  }

  onSearch(): void {
    const token = localStorage.getItem('accessToken');
    if (!this.searchInput || !token) {
      alert('Vui lòng nhập số điện thoại hoặc tên và đảm bảo bạn đã đăng nhập.');
      return;
    }

    const isPhoneSearch = /^\d{10}$/.test(this.searchInput);
    console.log("Phone or name: ", isPhoneSearch);

    if (isPhoneSearch) {
      // Search by phone
      const payload = {
        "participantUserIds": [this.currentUserId],
        "phone": this.searchInput,
        "privateChat": true
      };
      this.searchingService.fetchConversations(payload, token).subscribe({
        next: (response) => {
          if (response && response.content && response.content.length > 0) {
            // Map the participants and filter based on participantName
            this.searchResults = response.content.flatMap((conversation: any) =>
              conversation.participants
                .filter((participant: any) =>
                  participant.participantName.toLowerCase().includes(this.searchInput.toLowerCase())  // Filter by name
                )
                .map((participant: any) => ({
                  userId: participant.userId,
                  participantName: participant.participantName,
                  profilePhoto: participant.profilePhoto || 'assets/user.png'
                }))
            );
          } else {
            // If no matching conversations found, call searchUserByPhoneOrName
            this.searchingService.searchUserByPhoneOrName({ phone: this.searchInput }, token).subscribe({
              next: (userResponse) => {
                this.searchResults = (userResponse.content || []).map((user: any) => ({
                  userId: user.id,
                  participantName: user.UserName,
                  profilePhoto: user.profilePhoto || 'assets/user.png'
                }));
                if (this.searchResults.length === 0) {
                  alert('No conversations found with this user.');
                  this.openMessageInputDialog(this.selectedUser); // Open the dialog for message input
                }
              },
              error: (error) => {
                console.error('Error fetching user:', error);
                alert('Không tìm thấy thông tin liên lạc.');
              }
            });
          }
        },
        error: (error) => {
          console.error('Error fetching conversations:', error);
        }
      });
    } else {
      // Search by name
      const payload = {
        "participantUserIds": [this.currentUserId],
        "privateChat": true
        //"name": this.searchInput
      };
      this.searchingService.fetchConversations(payload, token).subscribe({
        next: (response) => {
          console.log("Search by name results:", response);
          const matchingConversations = response.content || [];
          if (matchingConversations.length > 0) {
            // Filter participants by name match
            const matchedUsers = matchingConversations.flatMap((conversation: any) =>
              conversation.participants.filter((participant: any) =>
                participant.participantName.toLowerCase().includes(this.searchInput.toLowerCase())  // Filter by name match
              )
            );

            this.searchResults = matchedUsers.map((participant: any) => ({
              userId: participant.userId,
              participantName: participant.participantName,
              profilePhoto: participant.profilePhoto || 'assets/user.png'
            }));

            // If no matching participants, show alert
            if (this.searchResults.length === 0) {
              alert('Không tìm thấy thông tin liên lạc. Vui lòng thử lại.');
            }

          } else {
            alert('Không tìm thấy thông tin liên lạc. Vui lòng thử lại.');
          }
        },
        error: (error) => {
          console.error('Error fetching conversations:', error);
        }
      });
    }
  }

  openMessageInputDialog(selectedUser: any): void {
    const dialogRef = this.dialog.open(MessageInputDialogComponent, {
      data: {
        currentUserId: this.currentUserId,
        selectedUser: selectedUser // Pass selected user to the dialog
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { message, response } = result; // Destructure message and response
        console.log('User entered message:', message);
        console.log('Response:', response);
        this.toastr.success("Kết bạn thành công!", 'success');
        this.fetchConversations();
        //resend the message
        if (!this.socket$) {
          console.error('WebSocket is not connected.');
          this.setupWebSocket(); // Attempt to reconnect
          return;
        }
        //this.sendMessage();
        const newMessage = {
          content: ('Day la tin nhan de ket ban: ' + '\n' + message).trim(),
          contentType: 'TEXT',
          conversationId: response.id,
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
        //   (response) => {
        //     this.toastr.success('Tạo nhóm thành công!', 'Success');
        //     //resend the message
        //     if (!this.socket$) {
        //       console.error('WebSocket is not connected.');
        //       this.setupWebSocket(); // Attempt to reconnect
        //       return;
        //     }
        //     this.messageText = result;
        //     //this.sendMessage();
        //     const newMessage = {
        //       content: this.messageText.trim(),
        //       contentType: 'TEXT',
        //       conversationId: result.id,
        //       senderId: groupPayload.Admin,
        //     };

        //     try {
        //       this.socket$.next(newMessage); // Send the message
        //       console.log('Message sent:', newMessage);
        //       this.fetchConversations();
        //       // Clear input field
        //       this.messageText = '';
        //     } catch (err) {
        //       console.error('Error sending message:', err);
        //       //this.setupWebSocket(); // Attempt to reconnect
        //     }
        //   },
        //   (error) => {
        //     console.error('Error creating group:', error);
        //     this.toastr.error('Tạo nhóm thất bại.', 'error');
        //   }
        // );
      }
    });
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
      this.openMessageInputDialog(selectedUser); // Open dialog to create a new conversation
    }
    this.searchInput = selectedUser.participantName;
  }

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
        this.currentUserPhoto = currentUser.profilePhoto || 'assets/user.png';
        break;
      }
    }
  }

  getParticipantNames(conversation: any): { names: string, photo: string } {
    let participantNames = '';
    let profilePhoto = 'assets/user.png'; // Default profile photo

    // Filter out the current user and get other participants
    const otherParticipants = conversation.participants
      .filter((participant: any) => participant.userId !== this.currentUserId);

    // If there are other participants, build the names and choose the profile photo for the first participant
    if (otherParticipants.length > 0) {
      participantNames = otherParticipants.map((participant: any) => participant.participantName).join(', ');
      // Use the profile photo of the first participant or the default photo
      profilePhoto = otherParticipants[0].profilePhoto || 'assets/user.png';

      const isPrivateChat = conversation.privateChat;
      if (!isPrivateChat) {
        profilePhoto = this.defaultGroupProfileImage;
      }
    }

    return { names: participantNames, photo: profilePhoto };
  }

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible; // Toggle menu visibility
  }

  // Function to select a user and display the conversation
  selectUser(user: User): void {
    this.selectedUser = user;
  }

  getSelectedUserConversation(): Message[] {
    return this.selectedUser ? this.conversations[this.selectedUser.id] : [];
  }

  selectConversation(conversation: any): void {
    if (!conversation) return;

    const conversationId = conversation.id; // Get the conversationId
    console.log('Selected Conversation ID:', conversationId);
    const isPrivateChat = conversation.privateChat;

    const participant = this.getParticipantNames(conversation);

    // Set the selected user object with both name and photo
    this.selectedUser = {
      id: conversationId,
      userName: participant.names,  // User name
      photo: participant.photo       // User photo
    };

    if (!isPrivateChat) {
      this.selectedUser.photo = this.defaultGroupProfileImage;
    }

    // Optionally, store the current conversation ID for other purposes
    this.activeView = 'conversations'; // Switch to conversations view if needed
    this.currentConversationId = conversationId;
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

  onClick(): void {
    this.showProfileEdit = true;
    this.setActiveView('edit-profile');
  }

  cancelEdit(): void {
    // Close the profile editing form
    this.showProfileEdit = false;
  }

  updateProfile(): void {
    // Handle profile update logic here
    console.log('Profile Updated:', {
      name: this.currentUserName,
      phone: this.currentUserPhone,
      email: this.currentUserEmail,
      birthdate: this.currentUserBirthdate,
      avatar: this.currentUserPhoto
    });

    // After updating the profile, close the form
    this.showProfileEdit = false;
  }

  getConversationMessages(): any[] {
    if (!this.selectedUser || !this.conversationsList) return [];

    // Find the selected conversation by matching the conversation ID
    const conversation = this.conversationsList.find(c => c.id === this.selectedUser?.id);

    // If the conversation exists, enrich each message with the sender's name
    if (conversation) {
      // Add the sender's name to each message
      conversation.chatMessages.forEach((message: { sender: any; senderName: any; }) => {
        const sender = conversation.participants.find((p: { userId: any; }) => p.userId === message.sender);
        message.senderName = sender ? sender.participantName : 'Unknown';  // Default to 'Unknown' if not found
      });
    }

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

  toggleMemberSelection(participant: any): void {
    if (this.isMemberSelected(participant.userId)) {
      this.removeFromGroup(participant.userId);
    } else {
      this.selectedMembers.push(participant);
    }
  }

  createGroup(): void {
    if (this.selectedMembers.length === 0) {
      alert('Please select at least one member to create a group.');
      this.toastr.warning('Chọn ít nhất thêm 1 thành viên để tạo nhóm', 'Warning');
      return;
    }

    const groupPayload = {
      Admin: this.currentUserId,
      participants: [this.currentUserId, ...this.selectedMembers.map(member => member.userId)],
    };

    console.log("Group participants:", groupPayload.participants);

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

  // Open the dialog to select a contact
  openContactDialog(): void {
    console.log(this.contacts);
    const dialogRef = this.dialog.open(ContactDialogComponent, {
      width: '300px',
      data: { contacts: this.contacts } // Pass the contacts to the dialog
    });

    dialogRef.afterClosed().subscribe((selectedContact) => {
      if (selectedContact) {
        console.log('Selected contact:', selectedContact);

        // Check if the selected user is already in the conversation
        const isAlreadyInConversation = this.isUserInCurrentConversation(selectedContact.userId);

        if (isAlreadyInConversation) {
          this.toastr.warning('Người dùng đã là thành viên của cuộc trò chuyện!', 'Warning');
        } else {
          this.addMemberToConversation(selectedContact.userId, this.currentConversationId);
        }
      }
    });
  }

  // Check if a user is already in the current conversation
  isUserInCurrentConversation(userId: number): boolean {
    if (!this.currentConversationId || !this.conversationsList) return false;

    const currentConversation = this.conversationsList.find(
      (conversation: any) => conversation.id === this.currentConversationId
    );

    if (!currentConversation || !currentConversation.participants) return false;

    // Check if the user is already a participant
    return currentConversation.participants.some(
      (participant: any) => participant.userId === userId
    );
  }

  // Add the selected member to the conversation
  addMemberToConversation(userId: number, conversationId: number): void {
    this.addMemberService.addParticipant(userId, conversationId).subscribe(
      (response) => {
        console.log('Member added successfully:', response);
        this.toastr.success('Thành viên mới đã được thêm thành công!', 'Success');
        this.fetchConversations(); // Refresh the conversation list
      },
      (error) => {
        console.error('Error adding member:', error);
        this.toastr.error('Lỗi khi thêm thành viên. Vui lòng thử lại!', 'Error');
      }
    );
  }

  removeFromGroup(participantId: number): void {
    this.selectedMembers = this.selectedMembers.filter(member => member.userId !== participantId);
  }

  // Remove participant using the service
  removeParticipant(participantId: number, conversationId: number): void {
    this.removeMemberService.removeParticipant(participantId, conversationId).subscribe(
      (response) => {
        console.log('Participant removed successfully:', response);
        this.toastr.success('Thành viên đã được xóa thành công!', 'Success');

        // Refresh conversation list
        this.fetchConversations();
      },
      (error) => {
        console.error('Error removing participant:', error);
        this.toastr.error('Lỗi khi xóa thành viên. Vui lòng thử lại!', 'Error');
      }
    );
  }

  // Open dialog to remove a member
  openRemoveMemberDialog(): void {
    if (!this.currentConversationId) {
      this.toastr.warning('Vui lòng chọn một cuộc trò chuyện trước!', 'Warning');
      return;
    }

    // Fetch participants from the current conversation
    const selectedConversation = this.conversationsList.find(
      (conversation) => conversation.id === this.currentConversationId
    );

    if (!selectedConversation || !selectedConversation.participants || selectedConversation.participants.length === 0) {
      this.toastr.warning('Không có thành viên nào trong cuộc trò chuyện này!', 'Warning');
      return;
    }

    // Open the dialog
    const dialogRef = this.dialog.open(RemoveMemberDialogComponent, {
      width: '300px',
      data: { participants: selectedConversation.participants },
    });

    dialogRef.afterClosed().subscribe((participantId) => {
      if (participantId) {
        this.removeParticipant(participantId, this.currentConversationId);
      }
    });
  }

  deleteConversation(): void {
    this.removeConversationDialogOpen = true;
    // Optionally, set the selected conversationId here
    // this.selectedConversationId = someId; // set it based on your logic
  }

  cancelRemove(): void {
    this.removeConversationDialogOpen = false;
  }

  confirmRemove(): void {
    if (this.currentConversationId !== null) {
      // Call the service to remove the participant
      this.removeConversationService.removeParticipant(this.currentConversationId).subscribe({
        next: (response) => {
          console.log('Participant removed successfully:', response);
          this.removeConversationDialogOpen = false;
          this.setActiveView('conversations');
          this.selectedUser = null;
          this.fetchConversations();
          // Handle successful response (e.g., show a success message)
        },
        error: (error) => {
          console.error('Error removing participant:', error);
          // Handle error (e.g., show an error message)
        }
      });
    }
  }
}
