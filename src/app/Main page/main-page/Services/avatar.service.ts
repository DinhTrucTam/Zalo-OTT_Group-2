import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AvatarService {
    private updateAvatarUrl = 'http://128.199.91.226:8082/api/update/avatar';

    constructor(private http: HttpClient) { }

    updateAvatar(file: File, userId: number, extension: string): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId.toString());
        formData.append('extension', extension);

        return this.http.post(this.updateAvatarUrl, formData);
    }
}
