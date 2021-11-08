import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RxFormControl, RxwebValidators } from '@rxweb/reactive-form-validators';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';

@Component({
	selector: 'app-descargue-lote',
	templateUrl: './descargue-lote.component.html',
	styleUrls: ['./descargue-lote.component.scss'],
})
export class DescargueLoteComponent implements OnInit {

	@Output() salidas = new EventEmitter();
	@Input() datos;
	@Input() posArray: number;

	constructor() { }

	ngOnInit() { }

	ngOnChanges() {
		this.initForm();
	}

	initForm() {
		let controls = {};
		controls['controllotes'] = new RxFormControl(null, [
			RxwebValidators.required({ message: 'Este campo es requerido' })
			, RxwebValidators.notEmpty({ message: 'Debe elegir al menos un lote' })
		], [], {}, {}, 'controllotes', []);
		controls['controldescargue'] = new RxFormControl(0, [], [], {}, {}, 'controldescargue', []);
		this.datos['form'] = FuncionesGenerales.crearFormulario(controls, true).formulario;
	}

	loteSeleccionado() {
		let lotes = this.datos['form'].get('controllotes').value;
		if (!lotes) return;
		this.datos['lotes'].forEach(it => {
			let enc = lotes.find(lot => lot == it.LoteProductoid);
			it.checked = false;
			if (enc) {
				it.InvenActua = (it.InvenActua == null || it.InvenActua == 0 ? it.InvenReal : it.InvenActua);
				it.checked = true;
			}
		});
		this.distribuirValoresLote();
		this.salidas.emit({
			tipo: 'form'
			, valor: this.datos['form'].valid
			, pos: this.posArray
		});
	}

	distribuirValoresLote() {
		let cantTotal = this.datos['cantireal'] < this.datos['cantirealsugerida'] ? this.datos['cantireal'] : this.datos['cantirealsugerida'];
		let info = this.datos['lotes'].filter(op => op.checked);
		info.forEach(lote => {
			if (lote['InvenActua'] > cantTotal) {
				if (+lote['InvenReal'] < cantTotal) {
					lote['InvenActua'] = cantTotal;
					cantTotal = cantTotal - (+lote['InvenReal']);
				} else {
					if (cantTotal > 0) {
						lote['InvenActua'] = cantTotal;
						cantTotal = cantTotal - (+lote['InvenReal']);
					} else {
						lote['InvenActua'] = 0;
					}
				}
			} else {
				if (+lote['InvenReal'] < cantTotal) {
					cantTotal = cantTotal - (+lote['InvenReal']);
				} else {
					lote['InvenActua'] = cantTotal;
					cantTotal = cantTotal - (+lote['InvenReal']);
				}
			}
		});
		if (!info.length) {
			this.datos['cantireal'] = this.datos['cantirealsugerida'];
		} else {
			this.actualizarTotal(null);
		}
	}

	actualizarTotal(lote) {
		if (this.datos['form'].valid) {
			let tempTotal = 0;
			this.datos['lotes'].filter(op => op.checked).forEach(it => tempTotal += (+it['InvenActua']));
			this.datos['cantireal'] = tempTotal;
		} else {
			this.datos['cantireal'] = this.datos['cantirealsugerida'];
		}
		if (lote && (lote['InvenActua'] >= (+lote['InvenReal']) || lote['InvenActua'] < 0 || lote['InvenActua'] == null)) {
			lote['InvenActua'] = (lote['InvenActua'] == null ? 0 : (+lote['InvenReal']));
		}
		if(lote && Number.parseFloat(lote['InvenActua']) > 0){
			lote['InvenActua'] = Number.parseFloat(lote['InvenActua']);
			document.getElementById('lote' + lote['InveProdLoteId'])['value'] = lote['InvenActua'];
			document.getElementById('lote' + lote['InveProdLoteId']).getElementsByTagName('input')[0]['value'] = lote['InvenActua'];
		}
	}

}
