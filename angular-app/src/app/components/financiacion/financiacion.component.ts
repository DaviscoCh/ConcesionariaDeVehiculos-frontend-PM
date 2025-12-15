import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-financiacion',
  standalone: false,
  templateUrl: './financiacion.component.html',
  styleUrl: './financiacion.component.css'
})
export class FinanciacionComponent {

  // Planes de financiamiento
  planes = [
    {
      meses: 12,
      interes: 5,
      cuotaEjemplo: 450,
      color: '#28a745',
      destacado: false,
      beneficios: ['Sin comisión de apertura', 'Aprobación en 24h', 'Pago anticipado sin penalización']
    },
    {
      meses: 24,
      interes: 8,
      cuotaEjemplo: 250,
      color: '#0066cc',
      destacado: true,
      beneficios: ['Más popular', 'Cuotas accesibles', 'Seguro de auto incluido']
    },
    {
      meses: 36,
      interes: 10,
      cuotaEjemplo: 180,
      color: '#ffc107',
      destacado: false,
      beneficios: ['Cuotas más bajas', 'Mayor flexibilidad', 'Opción de refinanciamiento']
    },
    {
      meses: 48,
      interes: 12,
      cuotaEjemplo: 145,
      color: '#6f42c1',
      destacado: false,
      beneficios: ['Plazo extendido', 'Mínimo pago mensual', 'Mantenimiento incluido 1 año']
    }
  ];

  // Requisitos
  requisitos = [
    { icono: 'bi-person-badge', texto: 'Cédula de identidad vigente' },
    { icono: 'bi-file-text', texto: 'Comprobante de ingresos' },
    { icono: 'bi-house-door', texto: 'Certificado de domicilio' },
    { icono: 'bi-credit-card', texto: 'Referencias bancarias' }
  ];

  // Ventajas
  ventajas = [
    {
      icono: 'bi-lightning-charge',
      titulo: 'Aprobación Rápida',
      descripcion: 'Respuesta en menos de 24 horas hábiles'
    },
    {
      icono: 'bi-shield-check',
      titulo: 'Sin Letra Pequeña',
      descripcion: 'Condiciones claras y transparentes'
    },
    {
      icono: 'bi-graph-up',
      titulo: 'Tasa Competitiva',
      descripcion: 'Las mejores tasas del mercado'
    },
    {
      icono: 'bi-cash-stack',
      titulo: 'Entrada Flexible',
      descripcion: 'Desde 10% del valor del vehículo'
    }
  ];

  constructor(private router: Router) { }

  agendarCita() {
    this.router.navigate(['/reservar-cita']);
  }

  verVehiculos() {
    this.router.navigate(['/vehiculos']);
  }

  contactarWhatsApp() {
    window.open('https://wa.me/593991234567', '_blank');
  }
}