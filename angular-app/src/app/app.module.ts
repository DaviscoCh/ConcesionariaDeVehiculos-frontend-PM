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
import { NotificacionesComponent } from './components/notificaciones/notificaciones.component';
import { ToastComponent } from './components/toast/toast.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FavoritosComponent } from './components/favoritos/favoritos.component';
import { FacturasComponent } from './components/facturas/facturas.component';
import { RepuestosComponent } from './components/repuestos/repuestos.component';
import { CheckoutRepuestosComponent } from './components/checkout-repuestos/checkout-repuestos.component';
import { HistorialComprasComponent } from './components/historial-compras/historial-compras.component';
import { FacturaRepuestoComponent } from './components/factura-repuesto/factura-repuesto.component';
import { MarcasComponent } from './components/marcas/marcas.component';
import { MarcaDetalleComponent } from './components/marca-detalle/marca-detalle.component';
import { ConcesionariosComponent } from './components/concesionarios/concesionarios.component';
import { SafePipe } from './components/pipes/safe.pipe';
import { OfertasComponent } from './components/ofertas/ofertas.component';
import { FinanciacionComponent } from './components/financiacion/financiacion.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    VehiculosComponent,
    VehiculosDetalleComponent,
    CotizadorComponent,
    PerfilComponent,
    TarjetasComponent,
    NotificacionesComponent,
    FavoritosComponent,
    FacturasComponent,
    RepuestosComponent,
    CheckoutRepuestosComponent,
    HistorialComprasComponent,
    FacturaRepuestoComponent,
    MarcasComponent,
    MarcaDetalleComponent,
    ConcesionariosComponent,
    SafePipe,
    OfertasComponent,
    FinanciacionComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    RegistroPersonaComponent,
    FormsModule,
    HistorialCitasComponent,
    ReservarCitaComponent,
    ToastComponent
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()) // <-- Aquí
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
