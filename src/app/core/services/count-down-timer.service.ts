// import { Injectable } from '@angular/core';
// import { BehaviorSubject, interval } from 'rxjs';
// import { map, take } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
// export class CountdownTimerService {
//   private timers: { [key: number]: { remainingTime: BehaviorSubject<string>; endTime: number } } = {};

//   constructor() {
//     this.restoreTimers(); // Restore timers on service initialization
//   }

//   // Start or restore a countdown
//   startCountdown(cardId: number, minutes: number): void {
//     const startTime = Date.now();
//     const endTime = startTime + minutes * 60 * 1000; // Calculate end time in milliseconds

//     // Store the countdown state in the service
//     this.timers[cardId] = {
//       remainingTime: new BehaviorSubject<string>(this.formatTime(minutes * 60)),
//       endTime: endTime,
//     };

//     // Save the timer state to localStorage
//     this.saveTimerState(cardId, endTime);

//     this.runCountdown(cardId);
//   }

//   // Run the countdown and update the remaining time
//   private runCountdown(cardId: number): void {
//     const totalSeconds = Math.floor((this.timers[cardId].endTime - Date.now()) / 1000);

//     if (totalSeconds <= 0) {
//       this.clearTimerState(cardId); // Clear state if the time has already elapsed
//       return;
//     }

//     interval(1000)
//       .pipe(
//         map(() => Math.max(0, Math.floor((this.timers[cardId].endTime - Date.now()) / 1000))), // Calculate remaining seconds
//         take(totalSeconds + 1), // Stop when countdown ends
//         map((remainingSeconds) => this.formatTime(remainingSeconds))
//       )
//       .subscribe({
//         next: (formattedTime) => {
//           this.timers[cardId].remainingTime.next(formattedTime);
//         },
//         complete: () => {
//           console.log(`Countdown for card ${cardId} finished.`);
//           this.clearTimerState(cardId);
//         },
//       });
//   }

//   // Restore the timers from localStorage when navigating between components
//   restoreTimers(): void {
//     const timerState = JSON.parse(localStorage.getItem('timerState') || '{}');
//     Object.keys(timerState).forEach((cardId) => {
//       const endTime = timerState[cardId];
//       if (Date.now() < endTime) {
//         this.timers[Number(cardId)] = {
//           remainingTime: new BehaviorSubject<string>(this.formatTime(Math.floor((endTime - Date.now()) / 1000))),
//           endTime: endTime,
//         };
//         this.runCountdown(Number(cardId));
//       }
//     });
//   }

//   // Helper methods to manage timer state in localStorage
//   private saveTimerState(cardId: number, endTime: number): void {
//     const timerState = JSON.parse(localStorage.getItem('timerState') || '{}');
//     timerState[cardId] = endTime;
//     localStorage.setItem('timerState', JSON.stringify(timerState));
//   }

//   private getTimerState(cardId: number): number | null {
//     const timerState = JSON.parse(localStorage.getItem('timerState') || '{}');
//     return timerState[cardId] || null;
//   }

//   private clearTimerState(cardId: number): void {
//     const timerState = JSON.parse(localStorage.getItem('timerState') || '{}');
//     delete timerState[cardId];
//     localStorage.setItem('timerState', JSON.stringify(timerState));
//   }

//   // Format seconds into MM:SS format
//   private formatTime(totalSeconds: number): string {
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//   }

//   // Get the remaining time for a specific card
//   getRemainingTime(cardId: number): BehaviorSubject<string> | null {
//     return this.timers[cardId]?.remainingTime || null;
//   }
// }










import { Injectable } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CountdownTimerService {
  private timers: { [key: number]: { remainingTime: BehaviorSubject<string>; endTime: number } } = {};

  constructor() {
    this.restoreTimers(); // Restore timers on service initialization
  }

  // Start or restore a countdown
  startCountdown(cardId: number, minutes: number): void {
    if (!this.timers[cardId]) {  // Only start a countdown if it isn't already running
      const startTime = Date.now();
      const endTime = startTime + minutes * 60 * 1000; // Calculate end time in milliseconds

      // Store the countdown state in the service
      this.timers[cardId] = {
        remainingTime: new BehaviorSubject<string>(this.formatTime(minutes * 60)),
        endTime: endTime,
      };

      // Save the timer state to localStorage
      this.saveTimerState(cardId, endTime);

      this.runCountdown(cardId);
    }
  }

  // Run the countdown and update the remaining time
  private runCountdown(cardId: number): void {
    const totalSeconds = Math.floor((this.timers[cardId].endTime - Date.now()) / 1000);

    if (totalSeconds <= 0) {
      this.clearTimerState(cardId); // Clear state if the time has already elapsed
      return;
    }

    interval(1000)
      .pipe(
        map(() => Math.max(0, Math.floor((this.timers[cardId].endTime - Date.now()) / 1000))), // Calculate remaining seconds
        take(totalSeconds + 1), // Stop when countdown ends
        map((remainingSeconds) => this.formatTime(remainingSeconds))
      )
      .subscribe({
        next: (formattedTime) => {
          this.timers[cardId].remainingTime.next(formattedTime);
        },
        complete: () => {
          console.log(`Countdown for card ${cardId} finished.`);
          this.clearTimerState(cardId);
        },
      });
  }

  // Restore the timers from localStorage when navigating between components
  restoreTimers(): void {
    const timerState = JSON.parse(localStorage.getItem('timerState') || '{}');
    Object.keys(timerState).forEach((cardId) => {
      const endTime = timerState[cardId];
      if (Date.now() < endTime) {
        this.timers[Number(cardId)] = {
          remainingTime: new BehaviorSubject<string>(this.formatTime(Math.floor((endTime - Date.now()) / 1000))),
          endTime: endTime,
        };
        this.runCountdown(Number(cardId));
      }
    });
  }

  // Helper methods to manage timer state in localStorage
  private saveTimerState(cardId: number, endTime: number): void {
    const timerState = JSON.parse(localStorage.getItem('timerState') || '{}');
    timerState[cardId] = endTime;
    localStorage.setItem('timerState', JSON.stringify(timerState));
  }

  private clearTimerState(cardId: number): void {
    const timerState = JSON.parse(localStorage.getItem('timerState') || '{}');
    delete timerState[cardId];
    localStorage.setItem('timerState', JSON.stringify(timerState));
  }

  // Format seconds into MM:SS format
  private formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Get the remaining time for a specific card
  getRemainingTime(cardId: number): BehaviorSubject<string> | null {
    return this.timers[cardId]?.remainingTime || null;
  }
}

