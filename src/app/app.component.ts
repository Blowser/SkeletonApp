import { Component } from '@angular/core';
import { DataService } from './services/data.service'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Inbox', url: '/folder/inbox', icon: 'mail' },
    { title: 'Outbox', url: '/folder/outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/spam', icon: 'warning' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

  constructor(private dataService: DataService) {
    // Inicializar la base de datos al cargar la aplicación
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await this.dataService.initializeDatabase();
      console.log('Base de datos inicializada correctamente.');
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
    }
  }
}
