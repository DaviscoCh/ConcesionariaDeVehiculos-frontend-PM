import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { NotificacionService } from '../../services/notificacion.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare var bootstrap: any;

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

  private tabAActivar: string | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private notificacionService: NotificacionService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    console.log('🔄 Cargando perfil...');

    // ✅ 1. CARGAR DATOS DESDE LOCALSTORAGE (siempre disponibles)
    this.cargarDesdeLocalStorage();

    // ✅ 2. Detectar pestaña a activar
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.tabAActivar = params['tab'];
      }
    });

    // ✅ 3. Intentar actualizar desde backend (opcional)
    this.intentarActualizarDesdeBackend();

    // ✅ 4. Cargar tarjetas y notificaciones
    this.cargarTarjetas();
    this.cargarContadorNotificaciones();

    // ✅ 5. Suscribirse al contador de notificaciones
    this.notificacionService.contador$.subscribe(total => {
      this.contadorNotificaciones = total;
    });
  }

  ngAfterViewInit(): void {
    if (this.tabAActivar) {
      setTimeout(() => {
        this.activarPestaña(this.tabAActivar!);
      }, 100);
    }
  }

  // ========================================
  // ✅ CARGAR DATOS DESDE LOCALSTORAGE
  // ========================================
  cargarDesdeLocalStorage(): void {
    const usuarioGuardado = localStorage.getItem('usuario');

    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        this.nombre = usuario.nombres || localStorage.getItem('nombre') || '';
        this.apellido = usuario.apellidos || localStorage.getItem('apellido') || '';
        this.correo = usuario.correo || localStorage.getItem('correo') || '';

        console.log('📦 Datos cargados desde localStorage: ');
        console.log('   Nombre:', this.nombre);
        console.log('   Apellido:', this.apellido);
        console.log('   Correo:', this.correo);
      } catch (error) {
        console.error('❌ Error al parsear usuario de localStorage:', error);
        // Fallback:  cargar directamente de las keys individuales
        this.nombre = localStorage.getItem('nombre') || '';
        this.apellido = localStorage.getItem('apellido') || '';
        this.correo = localStorage.getItem('correo') || '';
      }
    } else {
      // Fallback: cargar directamente de las keys individuales
      this.nombre = localStorage.getItem('nombre') || '';
      this.apellido = localStorage.getItem('apellido') || '';
      this.correo = localStorage.getItem('correo') || '';

      console.log('📦 Datos cargados desde localStorage (keys individuales):');
      console.log('   Nombre:', this.nombre);
      console.log('   Apellido:', this.apellido);
    }

    // El estado siempre será "activo" si está logueado
    this.estado = 'activo';
  }

  // ========================================
  // ✅ INTENTAR ACTUALIZAR DESDE BACKEND
  // ========================================
  intentarActualizarDesdeBackend(): void {
    // Verificar si el método getPerfil existe en el servicio
    if (typeof this.usuarioService.getPerfil === 'function') {
      console.log('🌐 Intentando actualizar datos desde backend...');

      this.usuarioService.getPerfil().subscribe({
        next: (data) => {
          console.log('✅ Datos recibidos del backend:', data);

          // Actualizar solo si hay datos válidos
          if (data.nombres) this.nombre = data.nombres;
          if (data.apellidos) this.apellido = data.apellidos;
          if (data.correo) this.correo = data.correo;
          if (data.estado) this.estado = data.estado;

          console.log('👤 Datos actualizados desde backend');
        },
        error: (err) => {
          console.warn('⚠️ No se pudo actualizar desde backend, usando datos de localStorage');
          console.error('Error:', err);
          // NO mostrar error al usuario, ya tenemos datos de localStorage
        }
      });
    } else {
      console.log('ℹ️ getPerfil() no disponible, usando solo localStorage');
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