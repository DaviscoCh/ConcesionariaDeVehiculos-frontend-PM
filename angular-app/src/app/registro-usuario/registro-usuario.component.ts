import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
    console.log('📨 Enviando credenciales:', correo, password);

    this.usuarioService.loginUsuario({ correo, password }).subscribe({
      next: (res: any) => {
        console.log('✅ Respuesta del login:', res);

        const token = res.token;
        const rol = res.rol;

        if (!token || !rol) {
          //console.warn('⚠️ Token o rol no recibido');
          this.cargando = false;
          return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('rol', rol);

        const usuario = res.usuario;
        if (usuario) {
          localStorage.setItem('usuario', JSON.stringify(usuario)); // ✅ Guarda el objeto completo con id_usuario
          localStorage.setItem('nombre', usuario.nombres ?? '');
          localStorage.setItem('apellido', usuario.apellidos ?? '');
          localStorage.setItem('correo', usuario.correo ?? '');
        }

        console.log(`🎉 Bienvenido ${usuario?.nombres ?? ''} (${rol})`);

        // 🔁 Redirección según el rol
        if (rol === 'admin') {
          window.location.href = 'http://localhost:3001/admin/dashboard';
        } else {
          this.router.navigate(['/home']);
        }

        this.cargando = false;
        this.loginForm.reset();
      },
      error: err => {
        console.error('❌ Error en login:', err);
        this.respuesta = err.error;
        this.cargando = false;
      }
    });
  }
}
