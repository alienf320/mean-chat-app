import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { NotificationService } from './notification.service';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  room = '';

  constructor(private socket: Socket, private notificationService: NotificationService) { }

  connect(username: string, room: string) {
    this.socket.connect();
    this.socket.emit('join-room', {username, room}, (response: string) => {
      this.notificationService.setNotification(response)
    })
  }

  changeRoom(room: string) {
    this.socket.emit('change-room', {room})
  }

  getMessages() {
    return this.socket.fromEvent<any>('chat-history');
  }

  sendMessage(message: any) {
    this.socket.emit('send-message', message);
  }

  receiveMessage() {
    return this.socket.fromEvent<any>('message');
  }

  disconnectSocket() {
    this.socket.disconnect();
  }


}
