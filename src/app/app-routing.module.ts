import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard'; // Importar el guard de las páginas



const routes: Routes = [
  {
    path: '', // Página inicial
    redirectTo: 'ingresar',
    pathMatch: 'full',
  },
  

  {
    path: 'ingresar',
    loadChildren: () =>
      import('./pages/ingresar/ingresar.module').then(
        (m) => m.IngresarPageModule
      ),
  },
  {
    path: 'registrarse',
    loadChildren: () => import('./pages/registrarse/registrarse.module').then( m => m.RegistrarsePageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard], // Protege esta ruta
  },

  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

