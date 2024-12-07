import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RemoveConversationService {

    private apiUrl = 'http://157.245.156.156:8082/api/conversation/remove/participant'; // API URL

    constructor(private http: HttpClient) { }

    // Method to remove participant from a conversation
    removeParticipant(conversationId: number): Observable<any> {
        const url = `${this.apiUrl}?conversationId=${conversationId}&isConvArch=true`; // Append query parameters
        return this.http.delete(url); // Send DELETE request
    }
}
