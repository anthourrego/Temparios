import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-semanas',
    templateUrl: './semanas.component.html',
    styleUrls: ['./semanas.component.scss'],
    standalone: false
})
export class SemanasComponent implements OnInit {

  @Input() dato: any;

  constructor() { }

  ngOnInit() {}

}
