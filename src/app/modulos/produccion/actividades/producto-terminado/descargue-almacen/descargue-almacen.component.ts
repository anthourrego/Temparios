import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'app-descargue-almacen',
	templateUrl: './descargue-almacen.component.html',
	styleUrls: ['./descargue-almacen.component.scss'],
})
export class DescargueAlmacenComponent implements OnInit {

	@Input() datos;
	@Input() posArray;
	@Output() salidas = new EventEmitter();

	constructor() { }

	ngOnInit() {
		setTimeout(() => {
			this.actualizarTotal();
		}, 100);
	}

	actualizarTotal() {
		if (this.datos['cantireal'] < 0 || this.datos['cantireal'] == null) {
			this.datos['cantireal'] = (this.datos['cantireal'] == null ? 0 : (+this.datos['cantidad']));
		}
		this.datos['cantireal'] = Number(this.datos['cantireal']);
		if (this.datos['cantireal'] > 0) {
			document.getElementById('prod' + this.posArray)['value'] = this.datos['cantireal'];
			document.getElementById('prod' + this.posArray).getElementsByTagName('input')[0]['value'] = this.datos['cantireal'];
		}
		this.salidas.emit({
			tipo: 'form'
			, valor: true
			, pos: this.posArray
		});
	}

}
