import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(): boolean {

        // ⛔ Verificar que estamos en el navegador (SSR-safe)
        if (typeof window === 'undefined') {
            console.warn('SSR: localStorage no disponible → permitir render básico');
            return true;
        }

        const token = localStorage.getItem('token');
        const rol = localStorage.getItem('rol');

        console.log('🔐 AuthGuard - Token:', token ? 'Presente' : 'Ausente');
        console.log('🔐 AuthGuard - Rol:', rol);

        if (!token || !rol) {
            console.log('❌ No hay token o rol - redirigiendo a login');
            this.router.navigate(['/login']);
            return false;
        }

        // ✅ Si es admin, redirigir a React
        if (rol === 'admin') {
            console.warn('🔄 Admin detectado → redirigiendo a React Admin');
            localStorage.clear();
            window.location.href = "http://localhost:3001/login";
            return false;
        }

        // ✅ Permitir acceso a clientes (cambiar 'usuario' por 'cliente')
        if (rol === 'cliente') {
            console.log('✅ Cliente autenticado - acceso permitido');
            return true;
        }

        // ❌ Rol no reconocido
        console.log('❌ Rol no reconocido:', rol);
        localStorage.clear();
        this.router.navigate(['/login']);
        return false;
    }
}