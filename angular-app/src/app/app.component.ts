import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { UsuarioService } from './services/usuario.service';
import { NotificacionService } from './services/notificacion.service';
import { ToastService } from './services/toast.service';
import { Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-app';
  usuarioAutenticado: boolean = false;
  nombreUsuario: string = '';
  contadorNotificaciones: number = 0;
  private yaSeNotifico: boolean = false; // ✅ Para evitar múltiples toasts
  private recordatorioInterval: any = null;
  private ultimoContador: number = 0;


  constructor(
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService,
    private toastService: ToastService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    console.log('🚀 AppComponent inicializado');

    // Verificar autenticación
    this.usuarioService.autenticado$.subscribe(estado => {
      console.log('👤 Estado de autenticación:', estado);
      this.usuarioAutenticado = estado;

      if (isPlatformBrowser(this.platformId) && estado) {
        this.nombreUsuario = localStorage.getItem('nombre') || 'Usuario';
        console.log('✅ Usuario autenticado:', this.nombreUsuario);

        // Cargar contador de notificaciones
        this.cargarContadorNotificaciones();
      } else {
        // Reset cuando cierra sesión
        this.yaSeNotifico = false;
      }
    });

    // Suscribirse al contador de notificaciones
    this.notificacionService.contador$.subscribe(total => {
      console.log('🔔 Contador de notificaciones actualizado:', total);
      this.contadorNotificaciones = total;

      // ✅ NUEVA notificación (contador aumentó)
      if (
        total > this.ultimoContador &&
        this.usuarioAutenticado
      ) {
        console.log('⚡ Nueva notificación detectada');
        this.mostrarToastNotificaciones();
      }

      // ✅ Iniciar recordatorio cada 5 min si hay notificaciones
      if (total > 0 && !this.recordatorioInterval) {
        this.iniciarRecordatorio();
      }

      // ✅ Detener recordatorio si ya no hay notificaciones
      if (total === 0) {
        this.detenerRecordatorio();
      }

      this.ultimoContador = total;
    });

    // ✅ Detectar cambios de ruta para cerrar toasts en perfil
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Si entramos a perfil, cerrar todos los toasts de notificaciones
        if (event.url.includes('/perfil')) {
          this.toastService.cerrarTodos();
        }
      });
  }

  cargarContadorNotificaciones(): void {
    console.log('📊 Cargando contador de notificaciones...');
    this.notificacionService.getContador().subscribe({
      next: (response) => {
        console.log('✅ Contador recibido:', response.total);
        this.contadorNotificaciones = response.total;
      },
      error: (err) => {
        console.error('❌ Error al cargar contador de notificaciones:', err);
      }
    });
  }

  mostrarToastNotificaciones(): void {
    console.log('🎯 Intentando mostrar toast con', this.contadorNotificaciones, 'notificaciones');

    // ✅ NO mostrar si estamos en perfil
    const rutaActual = this.router.url;
    if (rutaActual.includes('/perfil')) {
      console.log('⏭️ Omitiendo toast (ya en perfil)');
      return;
    }

    if (this.contadorNotificaciones > 0) {
      this.toastService.mostrarNotificaciones(
        this.contadorNotificaciones,
        () => {
          console.log('📍 Navegando a perfil con pestaña de notificaciones...');
          // ✅ Navegar a perfil con parámetro de query
          this.router.navigate(['/perfil'], {
            queryParams: { tab: 'notificaciones' }
          });
        }
      );
      console.log('✅ Toast llamado correctamente');
    }
  }

  iniciarRecordatorio(): void {
    console.log('⏰ Iniciando recordatorio de notificaciones cada 5 minutos');

    this.recordatorioInterval = setInterval(() => {
      if (
        this.contadorNotificaciones > 0 &&
        this.usuarioAutenticado
      ) {
        console.log('🔁 Recordatorio de notificaciones');
        this.mostrarToastNotificaciones();
      }
    }, 5 * 60 * 1000); // 5 minutos
  }

  detenerRecordatorio(): void {
    console.log('🛑 Deteniendo recordatorio de notificaciones');

    if (this.recordatorioInterval) {
      clearInterval(this.recordatorioInterval);
      this.recordatorioInterval = null;
    }
  }


  cerrarSesion(): void {
    Swal.fire({
      icon: 'success',
      title: 'Muchas gracias por tu visita :D',
      text: '¡Que tengas un excelente día! 🌟',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3085d6',
      timer: 3000,
      timerProgressBar: true,
    }).then(() => {
      this.usuarioService.logout();
      this.contadorNotificaciones = 0;
      this.yaSeNotifico = false; // ✅ Reset al cerrar sesión
      this.router.navigate(['/home']);
      this.detenerRecordatorio();
      this.ultimoContador = 0;
    });
  }
}