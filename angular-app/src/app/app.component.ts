import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { UsuarioService } from './services/usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend-concesionaria';
  usuarioAutenticado = false;
  nombreUsuario: string = '';
  mensajeBienvenida: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {

      // 🔄 Mantener estado inicial sincronizado
      this.usuarioService.actualizarEstado();

      // 👇 Escuchar cambios de autenticación
      this.usuarioService.autenticado$.subscribe((estado) => {
        this.usuarioAutenticado = estado;

        if (estado) {
          const nombre = localStorage.getItem('nombre');
          const apellido = localStorage.getItem('apellido');

          if (nombre && apellido) {
            this.nombreUsuario = `${nombre} ${apellido}`;
            this.mensajeBienvenida = `¡Bienvenido, ${this.nombreUsuario}!`;

            setTimeout(() => {
              this.mensajeBienvenida = '';
            }, 5000);
          }
        } else {
          this.nombreUsuario = '';
          this.mensajeBienvenida = '';
        }
      });
    }
  }

  cerrarSesion(): void {
    this.usuarioService.logout();

    Swal.fire({
      icon: 'success',
      title: 'Sesión cerrada',
      text: 'Has cerrado sesión correctamente. ¡Hasta pronto!',
      timer: 1500,
      showConfirmButton: false
    });

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1600);
  }
}
