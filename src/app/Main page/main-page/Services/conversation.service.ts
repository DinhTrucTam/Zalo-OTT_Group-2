import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private apiUrl = 'http://128.199.91.226:8082/api/conversation/fetch';

  constructor(private http: HttpClient) {}

  fetchConversations(participantUserId: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzMyNDYxMjUxLCJleHAiOjE3MzMwNjYwNTF9.S0cSC3ovtP9J4pdaJ9ThqhvR3uiNLnv_D_s2szovZ9WOESfGQh1g390yAM886JZii_ZYo0Sfo7HOHTNrYmdrLA'
    };

    const body = {
      participantUserId: participantUserId
    };

    return this.http.post<any>(this.apiUrl, body, { headers });
  }
}
