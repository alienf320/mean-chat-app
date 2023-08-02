import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<string>('');
  public notification$ = this.notificationSubject.asObservable();

  constructor(private socket: Socket) { }

  setNotification(message: string) {
    this.notificationSubject.next(message);
  }

  getNotification() {
    return this.socket.fromEvent<any>('notification');
  }

  sendNotification(notification: string, room: string) {
    this.socket.emit('send-notification', notification, room)
  }
}
