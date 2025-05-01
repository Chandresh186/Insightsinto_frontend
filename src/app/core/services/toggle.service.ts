import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToggleService {
  private toggleSubject = new BehaviorSubject<boolean>(false);
  toggle$ = this.toggleSubject.asObservable();

  setToggle(value: boolean) {
    this.toggleSubject.next(value);
  }

  toggle() {
    this.toggleSubject.next(false);
  }

  get currentValue(): boolean {
    return this.toggleSubject.value;
  }
}
