import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { UsuarioService } from './services/usuario.service';
import { Router } from '@angular/router';

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
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
    }
  }

}
