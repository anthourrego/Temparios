import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CustomInjectorService } from './config/peticiones/peticion.service';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        HttpClientModule,
        IonicStorageModule.forRoot({
            driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
            name: '__processDB',
            storeName: 'settings',
            description: 'TemparioApp data temp'
        }),
    ],
    providers: [{
            provide: RouteReuseStrategy,
            useClass: IonicRouteStrategy
        }],
    bootstrap: [AppComponent]
})
export class AppModule {
	constructor(private injector: Injector) {
		if (!CustomInjectorService.injector) {
			CustomInjectorService.injector = this.injector;
		}
	}
}
