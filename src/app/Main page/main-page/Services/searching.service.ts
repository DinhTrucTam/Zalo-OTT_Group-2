import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SearchingService {
    private searchUrl = 'http://128.199.91.226:8082/api/conversation/fetch';

    constructor(private http: HttpClient) { }

    searchContact(payload: any, token: string): Observable<any> {
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

        return this.http.post<any>(this.searchUrl, payload, { headers });
    }
}
