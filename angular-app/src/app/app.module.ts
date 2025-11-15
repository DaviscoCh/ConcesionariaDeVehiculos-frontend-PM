import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegistroPersonaComponent } from "./registro-persona/registro-persona.component";
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HomeComponent } from './components/home/home.component';
import { VehiculosComponent } from './components/vehiculos/vehiculos.component';
import { VehiculosDetalleComponent } from './components/vehiculos-detalle/vehiculos-detalle.component';
import { CotizadorComponent } from './components/cotizador/cotizador.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { TarjetasComponent } from './components/tarjetas/tarjetas.component';
import { HistorialCitasComponent } from './components/historial-citas/historial-citas.component';
import { ReservarCitaComponent } from './components/reservar-cita/reservar-cita.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    VehiculosComponent,
    VehiculosDetalleComponent,
    CotizadorComponent,
    PerfilComponent,
    TarjetasComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    RegistroPersonaComponent,
    FormsModule,
    HistorialCitasComponent,
    ReservarCitaComponent
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()) // <-- Aquí
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
