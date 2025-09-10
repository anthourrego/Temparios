import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CustomTimerService, TimerConfig } from '../../../servicios/custom-timer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'custom-countup-timer',
  template: `
    <div [class]="config?.timerClass || 'timer-display'">
      {{ timerDisplay }}
    </div>
  `,
  styles: [`
    .timer-display {
      font-family: 'Courier New', monospace;
      font-size: 1.2em;
      font-weight: bold;
    }
  `]
})
export class CustomCountupTimerComponent implements OnInit, OnDestroy {
  @Input() config?: TimerConfig;

  timerDisplay = '00:00:00';
  private subscription?: Subscription;

  constructor(private timerService: CustomTimerService) { }

  ngOnInit(): void {
    this.subscription = this.timerService.countupValue$.subscribe(value => {
      this.timerDisplay = value.text;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
