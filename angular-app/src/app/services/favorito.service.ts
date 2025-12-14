import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FavoritoService {
  private apiUrl = 'http://localhost:3000/api/favoritos';

  // Subject para actualizar la lista de favoritos en tiempo real
  private favoritosSubject = new BehaviorSubject<any[]>([]);
  public favoritos$ = this.favoritosSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Obtener headers con token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Agregar vehículo a favoritos
  agregarFavorito(id_vehiculo: string): Observable<any> {
    return this.http.post(
      this.apiUrl,
      { id_vehiculo },
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => this.obtenerFavoritos().subscribe()) // Actualizar lista
    );
  }

  // Eliminar vehículo de favoritos
  eliminarFavorito(id_vehiculo: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id_vehiculo}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => this.obtenerFavoritos().subscribe()) // Actualizar lista
    );
  }

  // Obtener todos los favoritos del usuario
  obtenerFavoritos(): Observable<any> {
    return this.http.get(
      this.apiUrl,
      { headers: this.getHeaders() }
    ).pipe(
      tap((response: any) => {
        this.favoritosSubject.next(response.data);
      })
    );
  }

  // Verificar si un vehículo es favorito
  verificarFavorito(id_vehiculo: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/verificar/${id_vehiculo}`,
      { headers: this.getHeaders() }
    );
  }

  // Toggle favorito (agregar o eliminar)
  toggleFavorito(id_vehiculo: string, esFavorito: boolean): Observable<any> {
    if (esFavorito) {
      return this.eliminarFavorito(id_vehiculo);
    } else {
      return this.agregarFavorito(id_vehiculo);
    }
  }

  // Limpiar favoritos al cerrar sesión
  clearFavoritos(): void {
    this.favoritosSubject.next([]);
  }
}