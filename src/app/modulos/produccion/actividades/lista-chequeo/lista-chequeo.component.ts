import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ListaChequeoService } from '../../../../servicios/lista-chequeo.service';
import { StorageService } from '../../../../servicios/storage.service';
import { NotificacionesService } from '../../../../servicios/notificaciones.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-lista-chequeo',
	templateUrl: './lista-chequeo.component.html',
	styleUrls: ['./lista-chequeo.component.scss'],
})
export class ListaChequeoComponent implements OnInit {

	@Input() datos;
	@Input() centroProduccion;
	arrLista: any = [];
	formulario: any = true;

	constructor(
		private modalController: ModalController,
		private listaChequeoService: ListaChequeoService,
		private storageService: StorageService,
		private notificacionesService: NotificacionesService,
		private router: Router
	) { }

	ngOnInit() {
		this.buscarListaChequeos('15018'/* datos['HeadProdId'] */);
	}

	cerrarModal(listar?) {
		this.modalController.dismiss(listar);
	}

	buscarListaChequeos(headProd) {
		this.listaChequeoService.informacion({}, 'ListaChequeo/listaWeb/' + headProd).then((resp) => {
			console.log("Respuesta ", resp);
			document.getElementById('listaHTML').innerHTML = resp.vista;

			if (resp.listaCheck.length) {
				this.ejecucionLista();
			}

			document.getElementById('btnContinuar').addEventListener('click', () => {
				this.ejecucionLista();
			});

			document.getElementById('btnVolver').addEventListener('click', () => {
				this.mostrarSeleccion();
			});
		}).catch((error) => {
			console.log(error);
		});;
	}

	ejecucionLista() {
		this.arrLista = [];
		var check = document.getElementsByName('checkLista');
		for (var i = 0; i < check.length; i++) {
			if (check[i]['checked']) {
				this.arrLista.push(parseInt(check[i]['value']));
			}
		}
		if (this.arrLista.length == 0) {
			alert("Seleccione al menos una lista de chequeo");
		} else {
			document.getElementById('listas').classList.add('hide');
			document.getElementById('formulario').classList.remove('hide');
			this.formulario = false;
			var frm = document.getElementById("formElements")['elements'];
			for (var i = 0; i < frm.length - 1; i++) {
				var elemento = frm[i];
				var atributos = frm[i].attributes;
				for (var x = 0; x < atributos.length - 1; x++) {
					var el = this.closestByClass(elemento, 'tblPrincipal');
					if (el != null) {
						if (el.classList.contains('hide') != false)
							break;
						if (atributos[x].name == 'listachequeoid') {
							var valor = parseInt(atributos[x].value);
							if (!(this.arrLista.indexOf(valor) > -1)) {
								el.classList.add('hide');
							}
						}
					}
				}
			}
		}
	}

	mostrarSeleccion() {
		this.arrLista = [];
		document.getElementById('listas').classList.remove('hide');
		document.getElementById('formulario').classList.add('hide');
		(<HTMLFormElement>document.getElementById('formElements')).reset();
		this.formulario = true;
		var elements = document.getElementById('formElements').children;
		for (var i = 0; i < elements.length; i++) {
			elements[i].classList.remove('hide');
		}
	}

	closestByClass(el: any, clazz: any) {
		while (el.className != clazz) {
			el = el.parentNode;
			if (!el) {
				return null;
			}
		}
		return el;
	}

	cargarDatos(data: any, elements: any) {
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var el = this.closestByClass(element, 'tblPrincipal');
			if (el != null) {
				if (element.name) {
					if (!data[element.getAttribute('listachequeoid')]) {
						data[element.getAttribute('listachequeoid')] = {};
					}
					if (!data[element.getAttribute('listachequeoid')][element.name]) {
						data[element.getAttribute('listachequeoid')][element.name] = {
							preguntaid: element.name
						};
					}
					if (element.getAttribute('tiporespuestaid') && !data[element.getAttribute('listachequeoid')][element.name]['tiporespuestaid']) {
						data[element.getAttribute('listachequeoid')][element.name]['tiporespuestaid'] = element.getAttribute('tiporespuestaid');
						data[element.getAttribute('listachequeoid')][element.name]['tipo'] = element.getAttribute('nombre');
					}
					if (element.classList.contains('tiempo') && !data[element.getAttribute('listachequeoid')][element.name]['tiempo']) {
						data[element.getAttribute('listachequeoid')][element.name]['tiempo'] = element.value;
					} else if (element.classList.contains('valor') && !data[element.getAttribute('listachequeoid')][element.name]['valor']) {
						data[element.getAttribute('listachequeoid')][element.name]['valor'] = element.value;
					} else {
						if (element.type === "checkbox") {
							if (element.getAttribute('nombre') == 'VALORLOGICO') {
								data[element.getAttribute('listachequeoid')][element.name]['value'] = element.checked;
							} else {
								if (element.checked) {
									data[element.getAttribute('listachequeoid')][element.name]['res'] = (data[element.getAttribute('listachequeoid')][element.name]['res'] || []).concat(element.value);
								}
							}
						} else if (element.options && element.multiple) {
							data[element.getAttribute('listachequeoid')][element.name]['res'] = this.getSelectValues(element);
						} else if (element.type == 'radio') {
							if (typeof data[element.getAttribute('listachequeoid')][element.name]['value'] === 'undefined') {
								data[element.getAttribute('listachequeoid')][element.name]['value'] = '';
								for (var i = 0; i < document.getElementsByName(element.name).length; i++) {
									if (document.getElementsByName(element.name)[i]['checked']) {
										data[element.getAttribute('listachequeoid')][element.name]['value'] = document.getElementsByName(element.name)[i]['value'];
										break;
									}
								}
							}
						} else {
							data[element.getAttribute('listachequeoid')][element.name]['value'] = element.value;
						}
					}
				}
			}
		}
		data['observacion'] = document.getElementById('observaciones')['value'];
		return data;
	}

	getSelectValues(select: any) {
		var resultado = [];
		var options = select && select.options;
		var opt;
		for (var i = 0; i < options.length; i++) {
			opt = options[i];

			if (opt.selected) {
				resultado.push(opt.value || opt.text);
			}
		}
		return resultado;
	};

	async submit() {
		let self = this;
		var form2 = document.getElementById("formElements");
		var $DATA2 = {};
		var data2 = {};
		data2 = this.cargarDatos({}, form2['elements']);
		$DATA2 = data2;
		var date = new Date();
		var fecha = date.getFullYear() + "-" + date.getDate() + "-" + (date.getMonth() + 1) + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
		var $LCOperacion = [];
		var elementos = document.querySelectorAll('input[LCOperacion][type="radio"]:checked, input[LCOperacion][type="checkbox"]:checked, option[LCOperacion]:checked');
		for (var i = 0; i < elementos.length; i++) {
			if (elementos[i].hasAttribute('LCOperacion') && elementos[i].getAttribute('LCOperacion') != '[]') {
				$LCOperacion = $LCOperacion.concat(JSON.parse(elementos[i].getAttribute('LCOperacion')));
			}
		}
		var $DATA: any = {
			lista: JSON.stringify($DATA2)
			, LoteProductoId: 'this.vehiculo.LoteProductoId'
			, fecha: fecha
			, LCOperacion: $LCOperacion
			, HeadProdId: this.datos.HeadProdId
			, VIN: 'this.vehiculo.VIN'
		};
		var ListasChequeadas = [];
		await this.storageService.get('ListasChequeadas').then(
			(data: any) => {
				if (data != null) {
					ListasChequeadas = JSON.parse(data);
				}
				ListasChequeadas.push($DATA);
			}
		).then(() => {
			this.storageService.get('VINSCHECK').then(async (data: any) => {
				if (data != null) {
					data = JSON.parse(data);
					for (var i = 0; i < data.length; i++) {
						if (data[i].LoteProductoId == $DATA.LoteProductoId) {
							data.splice(i, 1);
							break;
						}
					}
					await this.storageService.set('VINSCHECK', JSON.stringify(data));
					await this.storageService.set('ListasChequeadas', JSON.stringify(ListasChequeadas));
					this.notificacionesService.notificacion('Felicitaciones, se ha diligenciado la lista satisfactoriamente');
					this.router.navigateByUrl('/sgcheck');
				}
			});
		});
	}
}
