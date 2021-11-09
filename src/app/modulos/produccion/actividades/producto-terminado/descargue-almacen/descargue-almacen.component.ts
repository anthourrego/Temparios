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
		}, 500);
	}

	actualizarTotal() {
		if (this.datos['cantireal'] < 0 || this.datos['cantireal'] == null) {
			this.datos['cantireal'] = (this.datos['cantireal'] == null ? 0 : (+this.datos['cantidad']));
		}

		let valor = document.getElementById('prod' + this.posArray)['value'];
		if (valor && valor.length) {
			valor = valor.length > 1 ? (valor > 1 ? valor.replace(/^(0+)/g, '') : valor) : valor;
			document.getElementById('prod' + this.posArray)['value'] = valor;
			document.getElementById('prod' + this.posArray).getElementsByTagName('input')[0]['value'] = valor;
		} else {
			this.datos['cantireal'] = Number(this.datos['cantireal']);
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
