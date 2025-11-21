import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(): boolean {

        const token = localStorage.getItem('token');
        const rol = localStorage.getItem('rol');

        // ⛔ Si no hay token o rol → NO autenticado
        if (!token || !rol) {
            this.router.navigate(['/login']);
            return false;
        }

        // 🚫 Si es ADMIN → NO puede usar Angular
        if (rol === 'admin') {

            console.warn('Admin detectado en Angular → Eliminando token y redirigiendo');

            // Limpieza TOTAL (importante)
            localStorage.clear();

            // Redirigir directamente al login React
            window.location.href = "http://localhost:3001/dashboard";

            return false;
        }

        // ✔ Usuario normal → permitir
        if (rol === 'usuario') {
            return true;
        }

        // 🔁 Cualquier rol desconocido
        localStorage.clear();
        this.router.navigate(['/login']);
        return false;
    }
}
