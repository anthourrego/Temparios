import { Injectable } from '@angular/core';
import { required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService extends PeticionService {

  private _nroDocumento: string;
  private _password: string;

  constructor() {
    super();
  }


  @required({ message: 'Ingrese un valor valido.' })
  public get nroDocumento(): string {
    return this._nroDocumento;
  }
  public set nroDocumento(value: string) {
    this._nroDocumento = value;
  }

  @required({ message: 'Ingrese la contraseña.' })
  public get password(): string {
    return this._password;
  }
  public set password(value: string) {
    this._password = value;
  }
}
