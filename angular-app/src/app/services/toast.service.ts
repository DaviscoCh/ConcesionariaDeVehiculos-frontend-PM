import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
  duracion?: number;
  accion?: {
    texto: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  constructor() { }

  mostrar(toast: Omit<Toast, 'id'>): void {
    const id = this.generarId();
    const nuevoToast: Toast = {
      id,
      ...toast,
      duracion: toast.duracion || 5000 // 5 segundos por defecto
    };

    const toastsActuales = this.toastsSubject.value;
    this.toastsSubject.next([...toastsActuales, nuevoToast]);

    // Auto-cerrar después de la duración especificada
    if (nuevoToast.duracion && nuevoToast.duracion > 0) {
      setTimeout(() => {
        this.cerrar(id);
      }, nuevoToast.duracion);
    }
  }

  cerrar(id: string): void {
    const toastsActuales = this.toastsSubject.value;
    this.toastsSubject.next(toastsActuales.filter(t => t.id !== id));
  }

  cerrarTodos(): void {
    this.toastsSubject.next([]);
  }

  // Toast específico para notificaciones
  mostrarNotificaciones(cantidad: number, irANotificaciones: () => void): void {
    console.log('🎨 Creando toast de notificaciones...');
    this.mostrar({
      tipo: 'info',
      titulo: '🔔 Notificaciones nuevas',
      mensaje: `Tienes ${cantidad} ${cantidad === 1 ? 'notificación nueva' : 'notificaciones nuevas'}`,
      duracion: 8000, // ✅ Aumentado a 8 segundos
      accion: {
        texto: 'Ver ahora',
        callback: irANotificaciones
      }
    });
    console.log('✅ Toast de notificaciones creado');
  }

  private generarId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}