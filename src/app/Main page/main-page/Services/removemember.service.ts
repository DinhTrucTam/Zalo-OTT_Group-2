import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RemoveMemberService {
    private baseUrl = 'http://157.245.156.156:8082/api/conversation'; // Base URL for API

    constructor(private httpClient: HttpClient) { }

    removeParticipant(participantId: number, conversationId: number): Observable<any> {
        const url = `${this.baseUrl}/remove/participant?participantId=${participantId}&conversationId=${conversationId}`;
        return this.httpClient.delete(url, { headers: this.getAuthHeaders() });
    }

    // Helper method for authentication headers
    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }
}