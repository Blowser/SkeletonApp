import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  selectedSegment: string = 'anuncios'; // Segmento seleccionado
  usuarioLogeado: any = {}; // Objeto para los datos del usuario
  currentPosition: { latitude: number; longitude: number } | null = null;

  constructor(
    private menuCtrl: MenuController,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit() {
    // Habilitar el menú lateral
    this.menuCtrl.enable(true);

    // Cargar datos del usuario
    this.cargarDatosUsuario();
  }
  async obtenerUbicacion() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.currentPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      console.log('Ubicación obtenida:', this.currentPosition);
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
    }
  }

  ionViewWillEnter() {
    // Llama a la geolocalización al entrar en la vista
    if (this.selectedSegment === 'mapa') {
      this.obtenerUbicacion();
    }
  }

  // Método para cargar los datos del usuario desde SQLite
  async cargarDatosUsuario() {
    const usuario = localStorage.getItem('usuarioLogeado');
    if (usuario) {
      const { usuario: nombreUsuario } = JSON.parse(usuario); // Extraer el nombre de usuario
      try {
        const datos = await this.dataService.getUserData(nombreUsuario); // Obtener datos del usuario
        if (datos) {
          this.usuarioLogeado = datos;
          console.log('Datos del usuario cargados:', this.usuarioLogeado);
        } else {
          console.error('No se encontraron datos del usuario en la base de datos.');
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      }
    } else {
      console.error('No hay usuario logeado en localStorage.');
    }
  }

  // Método para guardar los datos editados del usuario
  async guardarDatos() {
    try {
      const actualizado = await this.dataService.updateUserData(this.usuarioLogeado);
      if (actualizado) {
        console.log('Datos del usuario actualizados:', this.usuarioLogeado);
        alert('Datos actualizados correctamente.');
      } else {
        alert('No se pudieron actualizar los datos.');
      }
    } catch (error) {
      console.error('Error al guardar datos del usuario:', error);
      alert('Hubo un error al intentar guardar los cambios.');
    }
  }

  // Método para cerrar sesión
  logout() {
    localStorage.removeItem('usuarioLogeado');
    console.log('Sesión cerrada.');
    this.router.navigate(['/ingresar']);
  }
}
