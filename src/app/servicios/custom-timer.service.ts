import { Injectable, EventEmitter } from '@angular/core';
import { Observable, interval, Subscription, BehaviorSubject } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

export interface TimerConfig {
  format?: string;
  timerClass?: string;
  timerTexts?: any;
}

export interface TimerDisplayModel {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomTimerService {
  private countupStartTime: Date | null = null;
  private countdownEndTime: Date | null = null;
  private countupSubscription?: Subscription;
  private countdownSubscription?: Subscription;

  public countupValue$ = new BehaviorSubject<TimerDisplayModel>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    text: '00:00:00'
  });

  public countdownValue$ = new BehaviorSubject<TimerDisplayModel>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    text: '00:00:00'
  });

  public onTimerStatusChange = new EventEmitter<string>();

  constructor() { }

  // Métodos para Count Up Timer
  startCountupTimer(): void {
    this.stopCountupTimer();
    this.countupStartTime = new Date();

    this.countupSubscription = interval(1000).subscribe(() => {
      if (this.countupStartTime) {
        const elapsed = new Date().getTime() - this.countupStartTime.getTime();
        const timerDisplay = this.formatTime(elapsed);
        this.countupValue$.next(timerDisplay);
      }
    });

    this.onTimerStatusChange.emit('START');
  }

  stopCountupTimer(): void {
    if (this.countupSubscription) {
      this.countupSubscription.unsubscribe();
      this.countupSubscription = undefined;
    }
    this.onTimerStatusChange.emit('STOP');
  }

  pauseCountupTimer(): void {
    if (this.countupSubscription) {
      this.countupSubscription.unsubscribe();
      this.countupSubscription = undefined;
    }
    this.onTimerStatusChange.emit('PAUSE');
  }

  resumeCountupTimer(): void {
    if (this.countupStartTime) {
      this.startCountupTimer();
      this.onTimerStatusChange.emit('RESUME');
    }
  }

  // Métodos para Count Down Timer
  startCountdownTimer(endDate: Date): void {
    this.stopCountdownTimer();
    this.countdownEndTime = endDate;

    this.countdownSubscription = interval(1000).pipe(
      map(() => {
        if (this.countdownEndTime) {
          return this.countdownEndTime.getTime() - new Date().getTime();
        }
        return 0;
      }),
      takeWhile(timeLeft => timeLeft >= 0)
    ).subscribe({
      next: (timeLeft) => {
        const timerDisplay = this.formatTime(timeLeft);
        this.countdownValue$.next(timerDisplay);
      },
      complete: () => {
        this.onTimerStatusChange.emit('COMPLETE');
      }
    });

    this.onTimerStatusChange.emit('START');
  }

  stopCountdownTimer(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = undefined;
    }
    this.onTimerStatusChange.emit('STOP');
  }

  private formatTime(milliseconds: number): TimerDisplayModel {
    const totalSeconds = Math.floor(Math.abs(milliseconds) / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedTime = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;

    return {
      days,
      hours,
      minutes,
      seconds,
      text: formattedTime
    };
  }

  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  // Método para limpiar recursos
  ngOnDestroy(): void {
    this.stopCountupTimer();
    this.stopCountdownTimer();
  }
}
