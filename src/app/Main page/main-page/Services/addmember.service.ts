import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AddMemberService {
    private readonly API_URL = 'http://157.245.156.156:8082/api/conversation';

    constructor(private http: HttpClient) { }

    /**
     * Adds a participant to the conversation.
     * @param userId ID of the user to add.
     * @param conversationId ID of the conversation.
     * @returns Observable of the HTTP response.
     */
    addParticipant(userId: number, conversationId: number): Observable<any> {
        const params = new HttpParams()
            .set('userId', userId.toString())
            .set('conversationId', conversationId.toString());

        return this.http.post(`${this.API_URL}/add/participant`, null, { params });
    }
}
