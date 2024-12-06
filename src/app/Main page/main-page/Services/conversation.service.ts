import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private apiUrl = 'http://157.245.156.156:8082/api/conversation/fetch';

  constructor(private http: HttpClient) {}

  fetchConversations(participantUserId: number): Observable<any> {
    const token = localStorage.getItem('accessToken'); // Retrieve token

    if (!token) {
      console.error('No token found in Local Storage.');
      return new Observable(observer => {
        observer.error('No token');
      });
    }

    const headers = new HttpHeaders({
      'Cookie': token,
      'Content-Type': 'application/json'
    });

    const body = { "participantUserIds":[participantUserId] };

    return this.http.post<any>(this.apiUrl, body, { headers });
  }
}