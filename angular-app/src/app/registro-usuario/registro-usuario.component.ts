import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { AuthService } from '../services/auth.service';
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
  codeForm: FormGroup;

  // Estados del flujo 2FA
  requiresTwoFactor = false;
  id_usuario: number | null = null;
  correoUsuario = '';

  cargando = false;
  respuesta: any;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router
  ) {
    // Formulario de login
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Formulario de código 2FA
    this.codeForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  /**
   * FASE 1: Login - Validar credenciales y enviar código 2FA
   */
  login() {
    console.log('🔑 Login iniciado');

    if (this.loginForm.invalid) {
      console.warn('Formulario inválido');
      Swal.fire({
        title: 'Error',
        text: 'Por favor completa todos los campos correctamente.',
        icon: 'warning'
      });
      return;
    }

    this.cargando = true;
    const { correo, password } = this.loginForm.value;

    // 🚫 Bloquear correos de administradores
    if (correo === 'admin@admin.com' || correo.endsWith('@carpremier.com')) {
      Swal.fire({
        title: 'Acceso Denegado',
        text: 'No autorizado para iniciar sesión en esta sección.',
        icon: 'error'
      });
      this.cargando = false;
      return;
    }

    this.authService.login(correo, password).subscribe({
      next: (res: any) => {
        console.log('✅ Respuesta del login:', res);

        // ✅ Verificar si requiere 2FA
        if (res.requiresTwoFactor) {
          this.requiresTwoFactor = true;
          this.id_usuario = res.id_usuario;
          this.correoUsuario = res.correo;

          Swal.fire({
            title: 'Código Enviado',
            text: 'Hemos enviado un código de verificación a tu correo.',
            icon: 'info',
            confirmButtonText: 'Aceptar'
          });

          this.cargando = false;
        } else {
          // Si por alguna razón no requiere 2FA (legacy), procesar login normal
          this.procesarLoginExitoso(res);
        }
      },
      error: err => {
        console.error('❌ Error en login:', err);
        this.cargando = false;

        Swal.fire({
          title: 'Error',
          text: err.error?.error || 'Correo o contraseña incorrectos.',
          icon: 'error'
        });
      }
    });
  }

  /**
   * FASE 2: Verificar código 2FA
   */
  verifyCode() {
    console.log('🔐 Verificando código 2FA');

    if (this.codeForm.invalid || !this.id_usuario) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor ingresa un código válido de 6 dígitos.',
        icon: 'warning'
      });
      return;
    }

    this.cargando = true;
    const codigo = this.codeForm.value.codigo;

    this.authService.verify2FA(this.id_usuario, codigo).subscribe({
      next: (res: any) => {
        console.log('✅ Código verificado:', res);
        this.procesarLoginExitoso(res);
      },
      error: err => {
        console.error('❌ Error al verificar código:', err);
        this.cargando = false;

        Swal.fire({
          title: 'Código Incorrecto',
          text: err.error?.error || 'El código ingresado es inválido o ha expirado.',
          icon: 'error'
        });
      }
    });
  }

  /**
   * Reenviar código 2FA
   */
  resendCode() {
    if (!this.id_usuario) return;

    console.log('🔄 Reenviando código...');

    Swal.fire({
      title: 'Enviando...',
      text: 'Reenviando código de verificación',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.authService.resendCode(this.id_usuario).subscribe({
      next: () => {
        Swal.fire({
          title: 'Código Reenviado',
          text: 'Hemos enviado un nuevo código a tu correo.',
          icon: 'success',
          timer: 2000
        });
      },
      error: err => {
        console.error('❌ Error al reenviar código:', err);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo reenviar el código. Intenta de nuevo.',
          icon: 'error'
        });
      }
    });
  }

  /**
   * Cancelar verificación 2FA y volver al login
   */
  cancelVerification() {
    this.requiresTwoFactor = false;
    this.id_usuario = null;
    this.correoUsuario = '';
    this.codeForm.reset();
    this.loginForm.reset();
  }

  /**
   * Procesar login exitoso (después de verificar 2FA)
   */
  private procesarLoginExitoso(res: any) {
    const token = res.token;
    const rol = res.rol;
    const usuario = res.usuario;

    if (!token || !rol) {
      this.cargando = false;
      return;
    }

    // 🚫 ADMIN → NO GUARDAR NADA (doble verificación)
    if (rol === 'admin') {
      console.warn("🚫 Admin detectado → NO guardar token/rol en Angular");
      localStorage.clear();
      window.location.href = "http://localhost:3001/admin/dashboard";
      return;
    }

    // ✔ USUARIO NORMAL → Guardar data
    localStorage.setItem('token', token);
    localStorage.setItem('rol', rol);

    if (usuario) {
      localStorage.setItem('usuario', JSON.stringify(usuario));
      localStorage.setItem('nombre', usuario.nombres ?? '');
      localStorage.setItem('apellido', usuario.apellidos ?? '');
      localStorage.setItem('correo', usuario.correo ?? '');
      localStorage.setItem('id_usuario', usuario.id_usuario ?? '');
    }

    console.log(`🎉 Bienvenido ${usuario?.nombres ?? ''} (${rol})`);

    this.usuarioService.actualizarEstado();

    // ✅ Login exitoso
    Swal.fire({
      title: `¡Bienvenido ${usuario?.nombres ?? ''}!`,
      text: 'Has iniciado sesión correctamente.',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3085d6',
      timer: 2000,
      timerProgressBar: true,
    });

    // Redirigir
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 1500);

    this.cargando = false;
    this.loginForm.reset();
    this.codeForm.reset();
    this.requiresTwoFactor = false;
  }
}