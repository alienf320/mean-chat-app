import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username: string = 'Fer';
  room: string = 'Default';

  constructor(private loginService: LoginService, private router: Router, private chatService: ChatService) {}

  login() {
    if (this.username.trim() !== '') {
      this.loginService.setCurrentUser(this.username);
      this.chatService.room = this.room;
      this.router.navigateByUrl('/chat');
    }
  }
}
