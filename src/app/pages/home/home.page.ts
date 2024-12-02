
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
interface ReporteMascota {
  latitude: number;
  longitude: number;
  name: string;
  description: string;
}







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
  mascotasPerdidas: { latitude: number; longitude: number; name: string; description: string }[] = [];
  currentPosition: { latitude: number; longitude: number } | null = null;
  
  constructor(
    private menuCtrl: MenuController,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.menuCtrl.enable(true);
    this.cargarDatosUsuario();
  }
  addMarkerOnClick() {
    this.map.on('click', (event: any) => {
      const { lat, lng } = event.latlng;
  
      // Abre un prompt para pedir datos del marcador
      const name = prompt('Nombre de la mascota:');
      const description = prompt('Descripción de la mascota:');
  
      if (name && description) {
        // Crea un marcador con los datos
        const marker = L.marker([lat, lng])
          .addTo(this.map)
          .bindPopup(`<b>${name}</b><br>${description}`)
          .openPopup();
  
        // Agrega los datos al array
        this.mascotasPerdidas.push({
          latitude: lat,
          longitude: lng,
          name: name,
          description: description,
        });
  
        console.log('Marcador agregado:', { lat, lng, name, description });
      } else {
        alert('Debe completar todos los datos.');
      }
    });
  }
  
  async ngAfterViewInit() {
    // Inicializar el mapa al cargar la app
    await this.initMap();
  }

  async initMap() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.currentPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
  
      this.map = L.map('map').setView(
        [this.currentPosition.latitude, this.currentPosition.longitude],
        13
      );
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);
  
      // Llama al método para agregar marcadores
      this.addMarkerOnClick();
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
  }
  

  async segmentChanged(event: any) {
    if (event.detail.value === 'mapa') {
      if (!this.mapInitialized) {
        // Inicializa el mapa solo una vez
        await this.initMap();
      } else {
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
