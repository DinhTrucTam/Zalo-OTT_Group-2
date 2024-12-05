import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

@Injectable({
    providedIn: 'root',
})

export class WebSocketService {
    private socket$!: WebSocketSubject<any>;

    connect(url: string, onMessage: (msg: any) => void, onError: (err: any) => void): void {
        this.socket$ = webSocket({
            url,
            deserializer: (msg) => {
                try {
                    return JSON.parse(msg.data);
                } catch {
                    return msg.data;
                }
            },
        });

        this.socket$.subscribe({
            next: onMessage,
            error: onError,
            complete: () => setTimeout(() => this.connect(url, onMessage, onError), 60000), // Reconnect
        });
    }

    sendMessage(message: any): void {
        if (this.socket$) {
            this.socket$.next(message);
        } else {
            console.error('WebSocket is not connected.');
        }
    }

    disconnect(): void {
        this.socket$.complete();
    }
}