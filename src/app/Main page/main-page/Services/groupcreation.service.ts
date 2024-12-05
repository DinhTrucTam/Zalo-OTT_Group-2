import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GroupCreationService {
    private readonly apiUrl = 'http://157.245.156.156:8082/api/conversation/generate'; // Replace with your API URL

    constructor(private http: HttpClient) { }

    /**
     * Create a new group with the specified admin and participants.
     * @param adminId The ID of the current user (admin).
     * @param participantIds The IDs of the selected participants.
     * @returns An Observable containing the API response.
     */
    createGroup(adminId: number, participantIds: number[]): Observable<any> {
        const requestBody = {
            Admin: adminId,
            participants: participantIds,
        };

        return this.http.post(this.apiUrl, requestBody);
    }
}
