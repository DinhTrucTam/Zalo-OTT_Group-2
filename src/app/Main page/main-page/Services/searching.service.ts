import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SearchingService {
    private fetchUrl = 'http://157.245.156.156:8082/api/conversation/fetch';
    private searchUrl = 'http://157.245.156.156:8082/api/user/find';

    constructor(private http: HttpClient) { }

    fetchConversations(payload: any, token: string): Observable<any> {
        if (!token) {
            console.error('No token found in Local Storage.');
            return new Observable(observer => {
                observer.error('No token');
            });
        }

        const headers = new HttpHeaders({
            'Cookie': `JSESSIONID=${token}`,
            'Content-Type': 'application/json',
        });

        return this.http.post<any>(this.fetchUrl, payload, { headers });
    }

    searchUserByPhoneOrName(payload: any, token: string): Observable<any> {
        if (!token) {
            console.error('No token found in Local Storage.');
            return new Observable(observer => {
                observer.error('No token');
            });
        }

        const headers = new HttpHeaders({
            'Cookie': `JSESSIONID=${token}`,
            'Content-Type': 'application/json',
        });

        return this.http.post<any>(this.searchUrl, payload, { headers });
    }
}
