import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  selectedSegment: string = 'anuncios'; // Segmento seleccionado
  usuarioLogeado: any = {}; // Datos del usuario
  map: any; // Referencia al mapa de Leaflet
  mapInitialized: boolean = false; // Para evitar múltiples inicializaciones

  constructor(
    private menuCtrl: MenuController,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.menuCtrl.enable(true);
    this.cargarDatosUsuario();
  }

  async ngAfterViewInit() {
    // Inicializar el mapa al cargar la app
    await this.initMap();
  }

  async initMap() {
    try {
      // Evitar inicializar el mapa más de una vez
      if (this.mapInitialized) return;

      // Obtener la ubicación actual
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // Crear el mapa centrado en la ubicación actual
      this.map = L.map('map', { attributionControl: false }).setView(
        [latitude, longitude],
        13
      );

      // Agregar la capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      // Agregar un marcador en la ubicación actual
      L.marker([latitude, longitude])
        .addTo(this.map)
        .bindPopup('Tu ubicación actual')
        .openPopup();

      this.mapInitialized = true; // Marcar como inicializado
      console.log('Mapa inicializado correctamente.');
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
  }

  async segmentChanged(event: any) {
    if (event.detail.value === 'mapa') {
      // Asegurar que el mapa se renderice correctamente al cambiar de pestaña
      if (this.map) {
        setTimeout(() => {
          this.map.invalidateSize(); // Refresca el tamaño del mapa
        }, 200);
      }
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
