import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  tarjetas: any[] = [];

  constructor(private usuarioService: UsuarioService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.usuarioService.getPerfil().subscribe({
      next: (data) => {
        this.nombre = data.nombres;
        this.apellido = data.apellidos;
        this.correo = data.correo;
        this.estado = data.estado;

        this.cargarTarjetas(); // ✅ actualiza tarjetas al entrar
      },
      error: (err) => {
        console.error('❌ Error al cargar perfil:', err);
        this.error = 'No se pudo cargar el perfil. Verifica tu sesión.';
      }
    });
  }

  cargarTarjetas(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:3000/api/tarjetas', { headers }).subscribe({
      next: (res: any) => this.tarjetas = res.tarjetas,
      error: (err: any) => console.error('Error al cargar tarjetas:', err)
    });
  }

}

