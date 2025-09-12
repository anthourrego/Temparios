import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FooterVersionComponent } from './footer-version/footer-version.component';
// AppVersion removido - usar AppInfoService



@NgModule({
	declarations: [HeaderComponent, FooterVersionComponent],
	imports: [
		IonicModule,
		CommonModule,
		FormsModule
	],
	exports: [HeaderComponent, FooterVersionComponent],
	providers: []
})
export class ComponentesModule { }
