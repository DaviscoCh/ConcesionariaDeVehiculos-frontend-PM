import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(): boolean {

        // ⛔ Verificar que estamos en el navegador (SSR-safe)
        if (typeof window === 'undefined') {
            console.warn('SSR: localStorage no disponible → permitir render básico');
            return true; // SSR solo debe renderizar HTML, no puede bloquear rutas
        }

        const token = localStorage.getItem('token');
        const rol = localStorage.getItem('rol');

        if (!token || !rol) {
            this.router.navigate(['/login']);
            return false;
        }

        if (rol === 'admin') {
            console.warn('Admin detectado en Angular → redirigiendo');

            localStorage.clear();
            window.location.href = "http://localhost:3001/login";
            return false;
        }

        if (rol === 'usuario') {
            return true;
        }

        localStorage.clear();
        this.router.navigate(['/login']);
        return false;
    }
}
