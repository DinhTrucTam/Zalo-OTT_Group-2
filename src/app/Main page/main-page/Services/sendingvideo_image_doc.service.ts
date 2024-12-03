import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FileUploadService {
    private uploadUrl = 'http://128.199.91.226:8082/api/file/upload';

    constructor(private http: HttpClient) { }

    uploadFile(file: File, contentType: string, extension: string): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('contentType', contentType);
        formData.append('extension', extension);

        return this.http.post<any>(this.uploadUrl, formData);
    }
}