import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ListaChequeoService } from '../../../../servicios/lista-chequeo.service';
import { NotificacionesService } from '../../../../servicios/notificaciones.service';

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
	datosLista: any = {};
	searching: boolean = false;

	constructor(
		private modalController: ModalController,
		private listaChequeoService: ListaChequeoService,
		private notificacionesService: NotificacionesService,
	) { }

	ngOnInit() {
		this.buscarListaChequeos();
	}

	cerrarModal(listar?) {
		this.modalController.dismiss(listar);
	}

	buscarListaChequeos() {
		let data = {
			headProdId: this.datos['HeadProdId'],
			OperacionId: this.datos['OperacionId'],
			OrdeProdOperacionId: this.datos['OrdeProdOperacionId'],
			grupo: this.datos['GrupoId']
		};
		this.searching = true;
		this.listaChequeoService.informacion(data, 'ListaChequeo/listaWeb').then((resp) => {
			this.datosLista = resp;
			document.getElementById('listaHTML').innerHTML = this.datosLista.vista;

			if (resp.listaCheck.length == 1) {
				this.ejecucionLista();
			}

			document.getElementById('btnContinuar').addEventListener('click', () => {
				this.ejecucionLista();
			});

			document.getElementById('btnVolver').addEventListener('click', () => {
				this.mostrarSeleccion();
			});
			this.searching = false;
		}).catch((error) => {
			console.log(error);
			this.searching = false;
		});
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

	async submit(cantidad?) {
		var $LCOperacion = [];
		var elementos = document.querySelectorAll('input[LCOperacion][type="radio"]:checked, input[LCOperacion][type="checkbox"]:checked, option[LCOperacion]:checked');
		for (var i = 0; i < elementos.length; i++) {
			if (elementos[i].hasAttribute('LCOperacion') && elementos[i].getAttribute('LCOperacion') != '[]') {
				$LCOperacion = $LCOperacion.concat(JSON.parse(elementos[i].getAttribute('LCOperacion')));
			}
		}
		if ($LCOperacion.length) {
			let cantidadValida = Number(this.datos.CantidadTotal);
			if (this.datos['GrupoId']) {
				cantidadValida = Number(this.datosLista['cantidad']);
			}
			let botones = [{
				text: 'Aceptar',
				handler: (data) => {
					let cantidad = data.cantidad == '' ? 0 : data.cantidad;
					cantidad = Number(cantidad);
					if (cantidad > 0) {
						if (cantidad <= cantidadValida) {
							this.guardarInformacion($LCOperacion, cantidad);
						} else {
							this.notificacionesService.notificacion(`Ha superado la cantidad maxima que es ${cantidadValida}`);
							return false;
						}
					} else {
						this.notificacionesService.notificacion("La cantidad debe ser mayor a 0.");
						return false;
					}
				}
			}, {
				text: 'Cancelar',
				role: 'cancel'
			}];
			this.notificacionesService.alerta(
				`¿Que cantidad desea confirmar? <br> Cantidad máxima ${cantidadValida}`
				, 'Cantidad'
				, ['alerta-input']
				, botones
				, [{ min: 0, max: cantidadValida, type: "number", name: "cantidad" }]
			);
		} else {
			this.guardarInformacion($LCOperacion, cantidad);
		}
	}

	guardarInformacion($LCOperacion, cantidad) {
		var date = new Date();
		var fecha = date.getFullYear() + "-" + date.getDate() + "-" + (date.getMonth() + 1) + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
		this.searching = true;
		var form2 = document.getElementById("formElements");
		var $DATA2 = {};
		var data2 = {};
		data2 = this.cargarDatos({}, form2['elements']);
		$DATA2 = data2;
		var $DATA: any = {
			lista: JSON.stringify($DATA2)
			, LoteProductoId: ''
			, fecha: fecha
			, LCOperacion: $LCOperacion
			, HeadProdId: (this.datos['GrupoId'] ? this.datosLista['headprodid'] : this.datos.HeadProdId) //Encabezado del producto
			, VIN: (this.datos['GrupoId'] ? this.datosLista['OrdeProdOperacionId'] : this.datos.OrdeProdOperacionId) //Orden de produccion
			, proceso: this.datosLista['nombreActividad']
			, OrdeProdId: (this.datos['GrupoId'] ? this.datosLista['OrdeProdId'] : this.datos.OrdeProdId)
			, cantReproceso: cantidad
			, cantidadTotal: this.datos['GrupoId'] ? this.datosLista['cantidad'] : +this.datos['CantidadTotal']
			, centroProd: this.centroProduccion
			, ultimo: this.datos['GrupoId'] ? this.datosLista['Ultimo'] : +this.datos['Ultimo']
		};
		this.listaChequeoService.informacion($DATA, 'ListaChequeo/Guardar').then((resp) => {
			if (resp.info == 1) {
				this.notificacionesService.notificacion("Felicitaciones, se ha diligenciado la lista satisfactoriamente");
				this.cerrarModal({ listar: true, listachequeo: true });
			} else {
				this.notificacionesService.notificacion("Lo sentimos, ocurrió un problema al diligenciar la lista");
			}
			this.searching = false;
		}).catch((error) => {
			console.log(error);
			this.searching = false;
		});
	}

}
