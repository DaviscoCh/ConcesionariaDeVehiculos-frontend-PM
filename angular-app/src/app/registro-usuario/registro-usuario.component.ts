import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-usuario',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './registro-usuario.component.html',
  styleUrl: './registro-usuario.component.css'
})
export class RegistroUsuarioComponent {
  loginForm: FormGroup;
  respuesta: any;
  cargando = false;

  constructor(private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login() {
    console.log('🔑 Login iniciado');

    if (this.loginForm.invalid) {
      console.warn('Formulario inválido');
      return;
    }

    this.cargando = true;
    const { correo, password } = this.loginForm.value;

    this.usuarioService.loginUsuario({ correo, password }).subscribe({
      next: (res: any) => {
        console.log('✅ Respuesta del login:', res);

        const token = res.token;
        const rol = res.rol;

        if (!token || !rol) {
          this.cargando = false;
          return;
        }

        // 🚫 ADMIN → NO GUARDAR NADA
        if (rol === 'admin') {
          console.warn("🚫 Admin detectado → NO guardar token/rol en Angular");

          localStorage.clear();

          window.location.href = "http://localhost:3001/admin/dashboard";
          return;
        }

        // ✔ USUARIO NORMAL → Guardar data
        localStorage.setItem('token', token);
        localStorage.setItem('rol', rol);

        const usuario = res.usuario;
        if (usuario) {
          localStorage.setItem('usuario', JSON.stringify(usuario));
          localStorage.setItem('nombre', usuario.nombres ?? '');
          localStorage.setItem('apellido', usuario.apellidos ?? '');
          localStorage.setItem('correo', usuario.correo ?? '');
        }

        console.log(`🎉 Bienvenido ${usuario?.nombres ?? ''} (${rol})`);

        this.usuarioService.actualizarEstado();

        // ⭐⭐ → SWAL FIRE AL LOGUEARSE CORRECTAMENTE
        Swal.fire({
          title: `Bienvenido ${usuario?.nombres ?? ''}!`,
          text: 'Has iniciado sesión correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6',
          timer: 2000,
          timerProgressBar: true,
        });

        // Redirigir después de un pequeño retraso
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1500);

        this.cargando = false;
        this.loginForm.reset();
      },

      error: err => {
        console.error('❌ Error en login:', err);
        this.respuesta = err.error;
        this.cargando = false;

        // ❌ Al fallar login → mensaje Swal
        Swal.fire({
          title: 'Error',
          text: 'Correo o contraseña incorrectos.',
          icon: 'error'
        });
      }
    });
  }
}
