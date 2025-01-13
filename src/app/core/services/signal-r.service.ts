import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private hubConnection: signalR.HubConnection;
  private messages: { count: number, message: any }[] = [];
  private messageSubject = new Subject<{ count: number, message: any }>();
  public startMessage$ = this.messageSubject.asObservable();
  private messageCountKey = 'messageCount';
  private notificationUrl = environment.notificationUrl;
  private _base = environment.URL;

  constructor(private _http: HttpClient) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.notificationUrl}/notificationHub`, {
        accessTokenFactory: () => JSON.parse(localStorage.getItem('currentUser') as string)?.response?.token,
        withCredentials: true
      })
      .build();
    this.startConnection();
    this.registerOnServerEvents();
    this.restoreMessages();
  }

  private startConnection(): void {
    this.hubConnection
      .start()
      .then(() => {
        
        console.log('SignalR Hub Connection Established Successfully!');
      })
      .catch(err => {
        console.error('Error starting SignalR hub connection:', err);
        setTimeout(() => this.startConnection(), 5000);
      });
  }

  private registerOnServerEvents(): void {
    this.hubConnection.on('BroadCastMessage', (message) => {
      this.messages.push({ count: this.messages.length + 1, message: message });
      this.messageSubject.next({ count: this.messages.length, message: message });
      this.saveMessages();
    });
  }

  private saveMessages(): void {
    localStorage.setItem(this.messageCountKey, JSON.stringify(this.messages));
    this.getMessageCount();
    this.getUserNotification();
  }

  private restoreMessages(): void {
    const storedMessages = localStorage.getItem(this.messageCountKey);
    const loggedUserEmail = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.email;
    if (storedMessages) {
      this.messages = JSON.parse(storedMessages);
      for (const storedMessage of this.messages) {
        if (storedMessage.message.email === loggedUserEmail) {
          this.messageSubject.next(storedMessage);
        }
      }
    }
  }

  public getMessageCount(): number {
    const loggedUserEmail = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.email;
    return this.messages.filter(message => message.message.email === loggedUserEmail).length;
  }

  private getHeaders(): HttpHeaders {
    const token: string = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  public getUserNotification() {
    const email = JSON.parse(localStorage.getItem('currentUser')!).response?.email;
    const headers = this.getHeaders();
    return this._http.get<any>(`${this._base}Notification/EventNotification?email=${email}`, { headers });
  }

  public readUserNotification() {
    const email = JSON.parse(localStorage.getItem('currentUser')!).response?.email;
    const headers = this.getHeaders();
    return this._http.post<any>(`${this._base}Notification/update_notification_status?email=${email}`, null, { headers });
  }

}
