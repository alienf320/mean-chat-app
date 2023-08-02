import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, take, takeUntil } from 'rxjs';
import { Room } from 'src/app/interfaces/room.model';
import { ChatService } from 'src/app/services/chat.service';
import { LoginService } from 'src/app/services/login.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage: string = '';
  username: string = '';
  rooms: Room[] = [];
  private destroy$ = new Subject<void>();
  constructor(
    private chatService: ChatService,
    public loginService: LoginService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.notificationService
      .getNotification()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notification => {
        const notificationMessage = {
          text: notification,
          room: this.chatService.room,
          notification: true, // Marca el mensaje como notificación
        };
        this.messages.push(notificationMessage);
        this.scrollToBottom();
      });

    this.chatService.connect(
      this.loginService.getCurrentUser()!,
      this.chatService.room
    );

    this.loginService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(name => {
        this.username = name;
      });

    this.chatService.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(chat => {
        console.log('rooms', chat.rooms)
        this.messages = chat.messages;
        this.rooms = chat.rooms;
        this.scrollToBottom();
      });

    this.chatService.receiveMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.messages.push(message);
        this.scrollToBottom();
      });
  }

  sendMessage() {
    if (this.newMessage.trim() !== '') {
      const sender = this.username;
      const message = {
        text: this.newMessage,
        sender: sender,
        room: this.chatService.room,
      };
      this.messages.push(message);
      this.chatService.sendMessage(message);
      this.newMessage = '';
      this.scrollToBottom();
    }
  }

  changeRoom(room: string) {
    this.notificationService.sendNotification(`User ${this.username} has left the room`, this.chatService.room);
    this.chatService.room = room;
    this.chatService.connect(
      this.loginService.getCurrentUser()!,
      room
    );
  }

  logout() {
    this.notificationService.sendNotification(`User ${this.username} has left the room`, this.chatService.room);
    this.chatService.disconnectSocket();
    this.loginService.logout();
    this.username = '';
    this.router.navigateByUrl('/login');
  }

  scrollToBottom() {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    });
  }

  ngOnDestroy() {
    // Emitir un valor al subject destroy$ para cancelar todas las suscripciones
    this.destroy$.next();
    this.destroy$.complete();
  }
}