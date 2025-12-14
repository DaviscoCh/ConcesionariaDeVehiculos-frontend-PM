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
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
