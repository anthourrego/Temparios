import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { countUpTimerConfigModel, CountdownTimerService } from '../../servicios/timer-replacement.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'countdown-timer',
    template: `<div [class]="config?.timerClass">{{ displayTime }}</div>`,
    styles: [`
    div {
      font-family: 'Courier New', monospace;
      font-weight: bold;
    }
  `],
    standalone: false
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  @Input() countDownTimerConfig?: countUpTimerConfigModel;

  displayTime = '00:00:00';
  private subscription?: Subscription;

  constructor(private timerService: CountdownTimerService) { }

  get config(): countUpTimerConfigModel | undefined {
    return this.countDownTimerConfig;
  }

  ngOnInit(): void {
    this.subscription = this.timerService.timerValue$.subscribe(value => {
      this.displayTime = value;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
