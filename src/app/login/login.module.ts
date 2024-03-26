import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { ModalconfiguracionComponent } from './componentes/modalconfiguracion/modalconfiguracion.component';


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		LoginPageRoutingModule,
		ReactiveFormsModule,
		RxReactiveFormsModule
	],
	declarations: [LoginPage, ModalconfiguracionComponent],
	providers: [AppVersion]
})
export class LoginPageModule { }
