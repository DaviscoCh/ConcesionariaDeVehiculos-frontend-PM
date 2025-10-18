import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  nombre: string = '';
  apellido: string = '';
  correo: string = '';
  estado: string = '';
  error: string = '';

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.usuarioService.getPerfil().subscribe({
      next: (data) => {
        this.nombre = data.nombres;
        this.apellido = data.apellidos;
        this.correo = data.correo;
        this.estado = data.estado;
      },
      error: (err) => {
        console.error('❌ Error al cargar perfil:', err);
        this.error = 'No se pudo cargar el perfil. Verifica tu sesión.';
      }
    });
  }
}

