import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page'; // Importa la página principal

const routes: Routes = [
  {
    path: '',
    component: HomePage, // Define la ruta base como el componente HomePage
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes), // Importa RouterModule para las rutas definidas
  ],
  exports: [
    RouterModule, // Exporta RouterModule para que esté disponible en otros módulos
  ],
})
export class HomePageRoutingModule {}
