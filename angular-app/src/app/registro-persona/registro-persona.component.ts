import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro-persona',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './registro-persona.component.html',
  styleUrl: './registro-persona.component.css'
})
export class RegistroPersonaComponent {
  personaForm: FormGroup;
  respuesta: any;
  cargando = false;

  constructor(private fb: FormBuilder, private usuarioService: UsuarioService) {
    this.personaForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      tipo_documento: ['', Validators.required],
      documento: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required]
    });
  }

  registrar() {
    if (this.personaForm.invalid) return;

    this.cargando = true;

    this.usuarioService.registrarUsuario(this.personaForm.value).subscribe({
      next: res => {
        this.respuesta = res;
        this.cargando = false;

        // ⭐ Swal cuando el registro es exitoso
        Swal.fire({
          title: 'Registro exitoso 🎉',
          text: 'Tu cuenta ha sido creada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6',
          timer: 3000,
          timerProgressBar: true,
        });

        this.personaForm.reset();
      },

      error: err => {
        this.respuesta = err.error;
        this.cargando = false;

        // ❌ Swal cuando hay error (correo duplicado, etc.)
        Swal.fire({
          title: 'Error en el registro',
          text: err.error?.message ?? 'Ocurrió un problema al registrar.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }
}
