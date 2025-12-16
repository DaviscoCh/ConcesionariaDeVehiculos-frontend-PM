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
  cargando = false;

  constructor(private fb: FormBuilder, private usuarioService: UsuarioService) {
    this.personaForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      tipo_documento: ['', Validators.required],
      documento: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/)  // Solo números
      ]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      telefono: ['', [
        Validators.required,
        Validators.minLength(7),
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/)  // Solo números
      ]],
      fecha_nacimiento: ['', Validators.required]
    });
  }

  registrar() {
    if (this.personaForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.personaForm.controls).forEach(key => {
        this.personaForm.get(key)?.markAsTouched();
      });

      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos correctamente.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    this.cargando = true;

    this.usuarioService.registrarUsuario(this.personaForm.value).subscribe({
      next: res => {
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

        // Restablecer el valor por defecto del select
        this.personaForm.patchValue({ tipo_documento: '' });
      },

      error: err => {
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