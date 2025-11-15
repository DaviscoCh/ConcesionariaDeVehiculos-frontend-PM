import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { UsuarioService } from './services/usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from './services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend-concesionaria';
  mostrarRegistro = false;
  usuarioAutenticado = false;
  nombreUsuario: string = '';
  mensajeBienvenida: string = '';
  logged = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('rol');
      const token = localStorage.getItem('token');
      const rol = localStorage.getItem('rol');

      if (token && rol === 'admin') {
        setTimeout(() => {
          window.location.href = 'http://localhost:3001/admin/dashboard';
        }, 100);
        return;
      }


      this.usuarioService.actualizarEstado();
      this.usuarioService.autenticado$.subscribe((valor) => {
        this.usuarioAutenticado = valor;

        const nombre = localStorage.getItem('nombre');
        const apellido = localStorage.getItem('apellido');

        if (valor && nombre && apellido) {
          this.nombreUsuario = `${nombre} ${apellido}`;
          this.mensajeBienvenida = `¡Bienvenido, ${this.nombreUsuario}!`;

          setTimeout(() => {
            this.mensajeBienvenida = '';
          }, 5000);
        }
      });
    }
  }

  mostrarFormulario() {
    this.mostrarRegistro = true;
  }

  cerrarFormulario() {
    this.mostrarRegistro = false;
  }

  cerrarSesion(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.usuarioService.logout();
      this.usuarioAutenticado = false;
      this.nombreUsuario = '';
      this.router.navigate(['/home']);
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión correctamente. ¡Hasta pronto!',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

}
