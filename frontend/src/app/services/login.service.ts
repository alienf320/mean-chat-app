import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private currentUserSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  currentUser$ = this.currentUserSubject.asObservable();

  // isLoggedIn(): boolean {
  //   return this.currentUser !== null;
  // }

  // login(username: string) {
  //   this.currentUser = username;
  // }

  logout() {
    this.currentUserSubject.next('');
  }

  getCurrentUser(): string | null {
    return this.currentUserSubject.getValue();
  }

  setCurrentUser(user: string) {
    this.currentUserSubject.next(user);
  }
}
