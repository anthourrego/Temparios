// Servicio de reemplazo para ngx-timer
import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

// Modelos compatibles con ngx-timer
export class countUpTimerConfigModel {
  timerClass?: string = '';
  timerTexts?: timerTexts = new timerTexts();
}

export class timerTexts {
  hourText?: string = ':';
  minuteText?: string = ':';
  secondsText?: string = '';
}

@Injectable({
  providedIn: 'root'
})
export class CountupTimerService {
  public onTimerStatusChange = new EventEmitter<string>();
  private subscription?: Subscription;
  private startTime?: Date;
  public timerValue$ = new BehaviorSubject<string>('00:00:00');

  startTimer(): void {
    this.stopTimer();
    this.startTime = new Date();

    this.subscription = interval(1000).subscribe(() => {
      if (this.startTime) {
        const elapsed = Math.floor((new Date().getTime() - this.startTime.getTime()) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;

        const display = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
        this.timerValue$.next(display);
      }
    });

    this.onTimerStatusChange.emit('START');
  }

  stopTimer(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
    this.onTimerStatusChange.emit('STOP');
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }
}

@Injectable({
  providedIn: 'root'
})
export class CountdownTimerService {
  public onTimerStatusChange = new EventEmitter<string>();
  private subscription?: Subscription;
  private endTime?: Date;
  public timerValue$ = new BehaviorSubject<string>('00:00:00');

  startTimer(endDate: Date): void {
    this.stopTimer();
    this.endTime = endDate;

    this.subscription = interval(1000).subscribe(() => {
      if (this.endTime) {
        const remaining = Math.floor((this.endTime.getTime() - new Date().getTime()) / 1000);

        if (remaining <= 0) {
          this.stopTimer();
          return;
        }

        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;

        const display = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
        this.timerValue$.next(display);
      }
    });

    this.onTimerStatusChange.emit('START');
  }

  stopTimer(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
    this.onTimerStatusChange.emit('STOP');
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
