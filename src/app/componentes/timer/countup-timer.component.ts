import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { countUpTimerConfigModel, CountupTimerService } from '../../servicios/timer-replacement.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'countup-timer',
    template: `<div [class]="config?.timerClass">{{ displayTime }}</div>`,
    styles: [`
    div {
      font-family: 'Courier New', monospace;
      font-weight: bold;
    }
  `],
    standalone: false
})
export class CountupTimerComponent implements OnInit, OnDestroy {
  @Input() countUpTimerConfig?: countUpTimerConfigModel;

  displayTime = '00:00:00';
  private subscription?: Subscription;

  constructor(private timerService: CountupTimerService) { }

  get config(): countUpTimerConfigModel | undefined {
    return this.countUpTimerConfig;
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
