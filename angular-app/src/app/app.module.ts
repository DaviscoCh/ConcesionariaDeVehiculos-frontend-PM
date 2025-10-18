import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistroPersonaComponent } from "./registro-persona/registro-persona.component";
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HomeComponent } from './components/home/home.component';
import { VehiculosComponent } from './components/vehiculos/vehiculos.component';
import { VehiculosDetalleComponent } from './components/vehiculos-detalle/vehiculos-detalle.component';
import { CotizadorComponent } from './components/cotizador/cotizador.component';
import { PerfilComponent } from './components/perfil/perfil.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    VehiculosComponent,
    VehiculosDetalleComponent,
    CotizadorComponent,
    PerfilComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    RegistroPersonaComponent,
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()) // <-- Aquí
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
