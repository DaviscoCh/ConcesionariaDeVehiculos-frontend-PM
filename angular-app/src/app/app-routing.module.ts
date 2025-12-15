import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { RegistroPersonaComponent } from './registro-persona/registro-persona.component';
import { RegistroUsuarioComponent } from './registro-usuario/registro-usuario.component';
import { VehiculosComponent } from './components/vehiculos/vehiculos.component';
import { HomeComponent } from './components/home/home.component';
import { VehiculosDetalleComponent } from './components/vehiculos-detalle/vehiculos-detalle.component';
import { CotizadorComponent } from './components/cotizador/cotizador.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { AuthGuard } from './guards/auth.guard';
import { ReservarCitaComponent } from './components/reservar-cita/reservar-cita.component';
import { NotificacionesComponent } from './components/notificaciones/notificaciones.component';
import { ToastComponent } from './components/toast/toast.component';
import { FavoritosComponent } from './components/favoritos/favoritos.component';
import { FacturasComponent } from './components/facturas/facturas.component';
import { RepuestosComponent } from './components/repuestos/repuestos.component';
import { CheckoutRepuestosComponent } from './components/checkout-repuestos/checkout-repuestos.component';
import { HistorialComprasComponent } from './components/historial-compras/historial-compras.component';
import { FacturaRepuestoComponent } from './components/factura-repuesto/factura-repuesto.component';
import { MarcasComponent } from './components/marcas/marcas.component';
import { MarcaDetalleComponent } from './components/marca-detalle/marca-detalle.component';
import { ConcesionariosComponent } from './components/concesionarios/concesionarios.component';
import { OfertasComponent } from './components/ofertas/ofertas.component';
import { FinanciacionComponent } from './components/financiacion/financiacion.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'registro', component: RegistroPersonaComponent },
  { path: 'login', component: RegistroUsuarioComponent },
  { path: 'vehiculos', component: VehiculosComponent },
  { path: 'vehiculos-detalle/:id', component: VehiculosDetalleComponent },
  { path: 'home', component: HomeComponent },
  { path: 'cotizador/:marca-modelo', component: CotizadorComponent, canActivate: [AuthGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard] },
  { path: 'reservar-cita', component: ReservarCitaComponent, canActivate: [AuthGuard] },
  { path: 'notificaciones', component: NotificacionesComponent, canActivate: [AuthGuard] },
  { path: 'toast', component: ToastComponent, canActivate: [AuthGuard] },
  { path: 'favoritos', component: FavoritosComponent, canActivate: [AuthGuard] },
  { path: 'facturas', component: FacturasComponent, canActivate: [AuthGuard] },
  { path: 'repuestos', component: RepuestosComponent, canActivate: [AuthGuard] },
  { path: 'checkout-repuestos', component: CheckoutRepuestosComponent, canActivate: [AuthGuard] },
  { path: 'historial-compras', component: HistorialComprasComponent, canActivate: [AuthGuard] },
  { path: 'factura-repuesto/:id', component: FacturaRepuestoComponent, canActivate: [AuthGuard] },
  { path: 'marcas', component: MarcasComponent },
  { path: 'marca-detalle/:id', component: MarcaDetalleComponent },
  { path: 'concesionarios', component: ConcesionariosComponent },
  { path: 'ofertas', component: OfertasComponent },
  { path: 'financiacion', component: FinanciacionComponent },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
