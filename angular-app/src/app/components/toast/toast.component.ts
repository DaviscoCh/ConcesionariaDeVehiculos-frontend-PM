import { Component, OnInit } from '@angular/core';
import { ToastService, Toast } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];
  isBrowser = true;

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toasts => {
      console.log('📬 [TOAST COMPONENT] Recibidos:', toasts.length, 'toasts'); // ⭐ AGREGAR SOLO ESTO
      this.toasts = toasts;
    });
  }

  cerrarToast(id: string): void {
    this.toastService.cerrar(id);
  }

  ejecutarAccion(toast: Toast): void {
    if (toast.accion) {
      toast.accion.callback();
      this.cerrarToast(toast.id);
    }
  }

  getIcono(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    };
    return iconos[tipo] || 'ℹ️';
  }

  getClaseTipo(tipo: string): string {
    return `toast-${tipo}`;
  }
}