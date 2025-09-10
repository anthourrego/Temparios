import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface TimerDisplayModel {
  displayTime: string;
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Injectable({
  providedIn: 'root'
})
export class SimpleTimerService {
  private timerSubscription?: Subscription;
  private startTime?: Date;
  private endTime?: Date;
  private stopSubject = new Subject<void>();

  public onTimerStatusChange = new Subject<string>();
  public currentTime$ = new BehaviorSubject<TimerDisplayModel>({
    displayTime: '00:00:00',
    totalSeconds: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  constructor() { }

  // Iniciar timer de cuenta regresiva
  startTimer(endDate?: Date): void {
    this.stopTimer();

    if (endDate) {
      // Countdown timer
      this.endTime = endDate;
      this.startCountdown();
    } else {
      // Countup timer
      this.startTime = new Date();
      this.startCountup();
    }

    this.onTimerStatusChange.next('START');
  }

  private startCountup(): void {
    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.stopSubject))
      .subscribe(() => {
        if (this.startTime) {
          const elapsed = Math.floor((new Date().getTime() - this.startTime.getTime()) / 1000);
          const timerDisplay = this.formatTime(elapsed);
          this.currentTime$.next(timerDisplay);
        }
      });
  }

  private startCountdown(): void {
    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.stopSubject))
      .subscribe(() => {
        if (this.endTime) {
          const remaining = Math.floor((this.endTime.getTime() - new Date().getTime()) / 1000);

          if (remaining <= 0) {
            this.stopTimer();
            this.onTimerStatusChange.next('COMPLETE');
            return;
          }

          const timerDisplay = this.formatTime(remaining);
          this.currentTime$.next(timerDisplay);
        }
      });
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.stopSubject.next();
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
    this.onTimerStatusChange.next('STOP');
  }

  private formatTime(totalSeconds: number): TimerDisplayModel {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const displayTime = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;

    return {
      displayTime,
      totalSeconds,
      hours,
      minutes,
      seconds
    };
  }

  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
