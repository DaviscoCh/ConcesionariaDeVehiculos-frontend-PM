import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FavoritoService } from '../../services/favorito.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-favoritos',
  standalone: false,
  templateUrl: './favoritos.component.html',
  styleUrl: './favoritos.component.css'
})
export class FavoritosComponent implements OnInit {
  favoritos: any[] = [];
  cargando = true;
  eliminando: Set<string> = new Set();

  constructor(
    private favoritoService: FavoritoService,
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit() {
    // Verificar que el usuario esté autenticado
    if (!this.usuarioService.isAuthenticated()) {
      this.router.navigate(['/home']);
      return;
    }

    this.cargarFavoritos();
  }

  cargarFavoritos() {
    this.cargando = true;
    this.favoritoService.obtenerFavoritos().subscribe({
      next: (response: any) => {
        this.favoritos = response.data;
        this.cargando = false;
      },
      error: err => {
        console.error('Error al cargar favoritos:', err);
        this.cargando = false;
      }
    });
  }

  eliminarFavorito(id_vehiculo: string) {
    if (this.eliminando.has(id_vehiculo)) {
      return; // Evitar doble click
    }

    const confirmar = confirm('¿Estás seguro de eliminar este vehículo de tus favoritos?');
    if (!confirmar) return;

    this.eliminando.add(id_vehiculo);

    this.favoritoService.eliminarFavorito(id_vehiculo).subscribe({
      next: () => {
        // Eliminar del array local
        this.favoritos = this.favoritos.filter(fav => fav.id_vehiculo !== id_vehiculo);
        this.eliminando.delete(id_vehiculo);
      },
      error: err => {
        console.error('Error al eliminar favorito:', err);
        alert('Error al eliminar el favorito. Inténtalo de nuevo.');
        this.eliminando.delete(id_vehiculo);
      }
    });
  }

  verDetalles(id_vehiculo: string) {
    this.router.navigate(['/vehiculos-detalle', id_vehiculo]);
  }

  irAVehiculos() {
    this.router.navigate(['/vehiculos']);
  }
}