import { Component } from '@angular/core';
import { VehiculoService } from '../../services/vehiculo.service';
import { FavoritoService } from '../../services/favorito.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-vehiculos',
  standalone: false,
  templateUrl: './vehiculos.component.html',
  styleUrl: './vehiculos.component.css'
})
export class VehiculosComponent {
  vehiculos: any[] = [];
  vehiculosFiltrados: any[] = [];
  cargando = true;

  // Control de favoritos
  favoritosIds: Set<string> = new Set();
  procesandoFavorito: Set<string> = new Set();

  // Listas para los filtros (se cargarán dinámicamente)
  marcas: string[] = [];
  modelos: string[] = [];
  tipos: string[] = [];
  colores: string[] = [];
  anios: number[] = [];

  // Filtros seleccionados
  filtros = {
    marca: '',
    modelo: '',
    anio: '',
    tipo: '',
    color: '',
    precioMin: '',
    precioMax: '',
    estado: '',
    busqueda: ''
  };

  // Control de visibilidad de filtros
  mostrarFiltros = false;

  constructor(
    private vehiculoService: VehiculoService,
    private favoritoService: FavoritoService,
    public usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.cargarVehiculos();

    // Si el usuario está autenticado, cargar sus favoritos
    if (this.usuarioService.isAuthenticated()) {
      this.cargarFavoritos();
    }
  }

  cargarVehiculos() {
    this.cargando = true;
    this.vehiculoService.getVehiculos().subscribe({
      next: data => {
        this.vehiculos = data;
        this.vehiculosFiltrados = data;
        this.extraerOpcionesFiltros();
        this.cargando = false;
      },
      error: err => {
        this.cargando = false;
        this.vehiculos = [];
        this.vehiculosFiltrados = [];
      }
    });
  }

  // Cargar favoritos del usuario
  cargarFavoritos() {
    this.favoritoService.obtenerFavoritos().subscribe({
      next: (response: any) => {
        // Crear un Set con los IDs de los vehículos favoritos
        this.favoritosIds = new Set(response.data.map((fav: any) => fav.id_vehiculo));
      },
      error: err => {
        console.error('Error al cargar favoritos:', err);
      }
    });
  }

  // Verificar si un vehículo es favorito
  esFavorito(id_vehiculo: string): boolean {
    return this.favoritosIds.has(id_vehiculo);
  }

  // Verificar si se está procesando un favorito
  estaProcesando(id_vehiculo: string): boolean {
    return this.procesandoFavorito.has(id_vehiculo);
  }

  // Toggle favorito
  toggleFavorito(id_vehiculo: string, event: Event) {
    event.stopPropagation(); // Evitar que se active el click del card

    // Verificar si el usuario está autenticado
    if (!this.usuarioService.isAuthenticated()) {
      alert('Debes iniciar sesión para agregar favoritos');
      return;
    }

    // Evitar múltiples clicks mientras se procesa
    if (this.estaProcesando(id_vehiculo)) {
      return;
    }

    const esFav = this.esFavorito(id_vehiculo);
    this.procesandoFavorito.add(id_vehiculo);

    this.favoritoService.toggleFavorito(id_vehiculo, esFav).subscribe({
      next: (response: any) => {
        // Actualizar el estado local
        if (esFav) {
          this.favoritosIds.delete(id_vehiculo);
        } else {
          this.favoritosIds.add(id_vehiculo);
        }
        this.procesandoFavorito.delete(id_vehiculo);
      },
      error: err => {
        console.error('Error al actualizar favorito:', err);
        this.procesandoFavorito.delete(id_vehiculo);
        alert('Error al actualizar favorito. Inténtalo de nuevo.');
      }
    });
  }

  // Extraer opciones únicas para los filtros
  extraerOpcionesFiltros() {
    this.marcas = [...new Set(this.vehiculos.map(v => v.marca))].sort();
    this.modelos = [...new Set(this.vehiculos.map(v => v.modelo))].sort();
    this.tipos = [...new Set(this.vehiculos.map(v => v.tipo))].sort();
    this.colores = [...new Set(this.vehiculos.map(v => v.color))].sort();
    this.anios = [...new Set(this.vehiculos.map(v => v.anio))].sort((a, b) => b - a);
  }

  // Aplicar filtros
  aplicarFiltros() {
    this.cargando = true;
    this.vehiculoService.getVehiculosFiltrados(this.filtros).subscribe({
      next: data => {
        this.vehiculosFiltrados = data;
        this.cargando = false;
      },
      error: err => {
        console.error('Error al filtrar:', err);
        this.cargando = false;
      }
    });
  }

  // Limpiar solo la búsqueda principal
  limpiarBusqueda() {
    this.filtros.busqueda = '';
    this.cargarVehiculos();
  }

  onBusquedaChange() {
    if (!this.filtros.busqueda || this.filtros.busqueda.trim() === '') {
      this.limpiarBusqueda();
    }
  }

  // Limpiar filtros
  limpiarFiltros() {
    this.filtros = {
      marca: '',
      modelo: '',
      anio: '',
      tipo: '',
      color: '',
      precioMin: '',
      precioMax: '',
      estado: '',
      busqueda: ''
    };
    this.cargarVehiculos();
  }

  // Verificar si hay filtros activos
  hayFiltrosActivos(): boolean {
    return Object.values(this.filtros).some(valor => valor !== '');
  }

  // Alternar visibilidad de filtros
  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }
}