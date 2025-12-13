import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { NotificacionService } from '../../services/notificacion.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare var bootstrap: any; // Para usar Bootstrap JS

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit, AfterViewInit {
  nombre: string = '';
  apellido: string = '';
  correo: string = '';
  estado: string = '';
  error: string = '';
  tarjetas: any[] = [];
  contadorNotificaciones: number = 0;

  private tabAActivar: string | null = null; // ✅ Para guardar la pestaña a activar

  constructor(
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // ✅ Detectar si viene el parámetro 'tab' en la URL
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.tabAActivar = params['tab'];
        console.log('📑 Pestaña a activar:', this.tabAActivar);
      }
    });

    this.usuarioService.getPerfil().subscribe({
      next: (data) => {
        this.nombre = data.nombres;
        this.apellido = data.apellidos;
        this.correo = data.correo;
        this.estado = data.estado;

        this.cargarTarjetas();
        this.cargarContadorNotificaciones();
      },
      error: (err) => {
        console.error('❌ Error al cargar perfil:', err);
        this.error = 'No se pudo cargar el perfil. Verifica tu sesión.';
      }
    });

    this.notificacionService.contador$.subscribe(total => {
      this.contadorNotificaciones = total;
    });
  }

  ngAfterViewInit(): void {
    // ✅ Activar la pestaña después de que la vista esté lista
    if (this.tabAActivar) {
      setTimeout(() => {
        this.activarPestaña(this.tabAActivar!);
      }, 100);
    }
  }

  activarPestaña(nombreTab: string): void {
    const tabId = `${nombreTab}-tab`;
    const tabElement = document.getElementById(tabId);

    if (tabElement) {
      const tab = new bootstrap.Tab(tabElement);
      tab.show();
      console.log('✅ Pestaña activada:', nombreTab);
    } else {
      console.warn('⚠️ No se encontró la pestaña:', tabId);
    }
  }

  cargarTarjetas(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:3000/api/tarjetas', { headers }).subscribe({
      next: (res: any) => this.tarjetas = res.tarjetas,
      error: (err: any) => console.error('Error al cargar tarjetas:', err)
    });
  }

  cargarContadorNotificaciones(): void {
    this.notificacionService.getContador().subscribe({
      next: (response) => {
        this.contadorNotificaciones = response.total;
      },
      error: (err) => {
        console.error('Error al cargar contador de notificaciones:', err);
      }
    });
  }
}