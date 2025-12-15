import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Provincia {
  nombre: string;
  ciudad: string;
  lat: number;
  lng: number;
  telefono: string;
  email: string;
  direccion: string;
  color: string;
}

@Component({
  selector: 'app-concesionarios',
  standalone: false,
  templateUrl: './concesionarios.component.html',
  styleUrl: './concesionarios.component.css'
})
export class ConcesionariosComponent {

  provinciaSeleccionada: Provincia | null = null;
  mapaUrl: string = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d16319113.298628744!2d-88.11969959999999!3d-1.3397668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902387e8f5e0c745%3A0x614c9fda7e4d1c9a!2sEcuador!5e0!3m2!1ses!2sec!4v1702345678901!5m2!1ses!2sec';

  // Provincias con oficinas
  provincias: Provincia[] = [
    {
      nombre: 'Pichincha',
      ciudad: 'Quito',
      lat: -0.1807,
      lng: -78.4678,
      telefono: '+593 2 234 5678',
      email: 'quito@carpremier.com',
      direccion: 'Av. Amazonas N24-03 y Colón, Quito',
      color: '#0066cc'
    },
    {
      nombre: 'Guayas',
      ciudad: 'Guayaquil',
      lat: -2.1709,
      lng: -79.9224,
      telefono: '+593 4 567 8901',
      email: 'guayaquil@carpremier.com',
      direccion: 'Av. 9 de Octubre y Malecón, Guayaquil',
      color: '#28a745'
    },
    {
      nombre: 'Azuay',
      ciudad: 'Cuenca',
      lat: -2.9005,
      lng: -79.0059,
      telefono: '+593 7 890 1234',
      email: 'cuenca@carpremier.com',
      direccion: 'Av. Ordóñez Lasso, Cuenca',
      color: '#dc3545'
    },
    {
      nombre: 'Tungurahua',
      ciudad: 'Ambato',
      lat: -1.2543,
      lng: -78.6308,
      telefono: '+593 3 456 7890',
      email: 'ambato@carpremier.com',
      direccion: 'Av. Cevallos y Bolívar, Ambato',
      color: '#ffc107'
    },
    {
      nombre: 'Manabí',
      ciudad: 'Manta',
      lat: -0.9537,
      lng: -80.7089,
      telefono: '+593 5 123 4567',
      email: 'manta@carpremier.com',
      direccion: 'Malecón Escénico, Manta',
      color: '#6f42c1'
    },
    {
      nombre: 'El Oro',
      ciudad: 'Machala',
      lat: -3.2581,
      lng: -79.9553,
      telefono: '+593 7 234 5678',
      email: 'machala@carpremier.com',
      direccion: 'Av. 25 de Junio, Machala',
      color: '#fd7e14'
    }
  ];

  // Información general (cuando no hay provincia seleccionada)
  contactoGeneral = {
    telefono: '+593 2 123 4567',
    whatsapp: '+593 99 123 4567',
    email: 'info@carpremier.com',
    horario: 'Lunes a Viernes: 8:00 AM - 6:00 PM\nSábados: 9:00 AM - 2:00 PM',
    direccion: 'Servicio a nivel nacional'
  };

  // Servicios destacados
  servicios = [
    {
      icon: 'bi-calendar-check',
      titulo: 'Agendamiento Fácil',
      descripcion: 'Agenda tu cita online y te asignamos la oficina más cercana'
    },
    {
      icon: 'bi-truck',
      titulo: 'Entrega a Domicilio',
      descripcion: 'Llevamos tu vehículo hasta la puerta de tu casa'
    },
    {
      icon: 'bi-shield-check',
      titulo: 'Garantía Extendida',
      descripcion: 'Todos nuestros vehículos incluyen garantía de fábrica'
    },
    {
      icon: 'bi-credit-card',
      titulo: 'Financiamiento',
      descripcion: 'Opciones de pago flexibles adaptadas a tu presupuesto'
    }
  ];

  constructor(private router: Router) { }

  seleccionarProvincia(provincia: Provincia) {
    this.provinciaSeleccionada = provincia;

    // Actualizar URL del mapa con las coordenadas de la provincia
    this.mapaUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d${provincia.lng}!3d${provincia.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sec`;
  }

  verTodasLasProvincias() {
    this.provinciaSeleccionada = null;
    this.mapaUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d16319113.298628744!2d-88.11969959999999!3d-1.3397668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902387e8f5e0c745%3A0x614c9fda7e4d1c9a!2sEcuador!5e0!3m2!1ses!2sec!4v1702345678901!5m2!1ses!2sec';
  }

  agendarCita() {
    this.router.navigate(['/reservar-cita']);
  }

  contactarWhatsApp() {
    const numero = this.provinciaSeleccionada
      ? this.provinciaSeleccionada.telefono.replace(/[^0-9]/g, '')
      : this.contactoGeneral.whatsapp.replace(/[^0-9]/g, '');

    window.open(`https://wa.me/${numero}`, '_blank');
  }

  get contactoActual() {
    if (this.provinciaSeleccionada) {
      return {
        telefono: this.provinciaSeleccionada.telefono,
        email: this.provinciaSeleccionada.email,
        direccion: this.provinciaSeleccionada.direccion,
        ciudad: this.provinciaSeleccionada.ciudad
      };
    }
    return this.contactoGeneral;
  }
}