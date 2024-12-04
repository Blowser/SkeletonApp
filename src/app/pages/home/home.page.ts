import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http'; // Importamos HttpClient para consumir la API
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
  mascotasPerdidas: ReporteMascota[] = [];
  currentPosition: { latitude: number; longitude: number } | null = null;
  anuncios: any[] = []; // Arreglo para almacenar los anuncios obtenidos de la API

  constructor(
    private menuCtrl: MenuController,
    private router: Router,
    private dataService: DataService,
    private http: HttpClient // Inyección de HttpClient
  ) {}

  ngOnInit() {
    this.menuCtrl.enable(true);
    this.cargarDatosUsuario(); // Carga los datos del usuario al inicializar
    if (this.selectedSegment === 'anuncios') {
      this.obtenerAnuncios(); // Carga anuncios al inicio si el segmento es "anuncios"
    }
  }

  async ngAfterViewInit() {
    // Inicializar el mapa si el segmento seleccionado es "mapa"
    if (this.selectedSegment === 'mapa') {
      await this.initMap();
    }
  }

  async segmentChanged(event: any) {
    const segment = event.detail.value; // Obtiene el segmento seleccionado
    console.log('Segmento cambiado a:', segment);

    if (segment === 'anuncios') {
      console.log('Entrando en segmento anuncios');
      this.obtenerAnuncios(); // Llama al método para obtener anuncios
    } else if (segment === 'mis-datos') {
      console.log('Entrando en segmento mis-datos');
      try {
        // Refresca los datos del usuario cuando se selecciona este segmento
        await this.cargarDatosUsuario();
        console.log('Datos del usuario actualizados para el segmento mis-datos.');
      } catch (error) {
        console.error('Error al actualizar datos del usuario:', error);
      }
    } else if (segment === 'mapa') {
      console.log('Entrando en segmento mapa');
      if (!this.mapInitialized) {
        // Inicializa el mapa solo la primera vez que se selecciona este segmento
        await this.initMap();
        this.mapInitialized = true; // Marca el mapa como inicializado
      } else {
        setTimeout(() => {
          this.map.invalidateSize(); // Refresca el tamaño del mapa si ya está inicializado
        }, 200);
      }
    } else {
      console.warn(`Segmento desconocido seleccionado: ${segment}`);
      // Maneja un segmento inesperado si fuera necesario
    }
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

  addMarkerOnClick() {
    this.map.on('click', (event: any) => {
      const { lat, lng } = event.latlng;

      const name = prompt('Nombre de la mascota:');
      const description = prompt('Descripción de la mascota:');

      if (name && description) {
        const marker = L.marker([lat, lng])
          .addTo(this.map)
          .bindPopup(`<b>${name}</b><br>${description}`)
          .openPopup();

        this.mascotasPerdidas.push({
          latitude: lat,
          longitude: lng,
          name,
          description,
        });

        console.log('Marcador agregado:', { lat, lng, name, description });
      } else {
        alert('Debe completar todos los datos.');
      }
    });
  }

  async cargarDatosUsuario() {
    const usuario = localStorage.getItem('usuarioLogeado');
    if (usuario) {
      const { usuario: nombreUsuario } = JSON.parse(usuario);
      try {
        const datos = await this.dataService.getUserData(nombreUsuario);
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

  logout() {
    localStorage.removeItem('usuarioLogeado');
    console.log('Sesión cerrada.');
    this.router.navigate(['/ingresar']);
  }

  obtenerAnuncios() {
    const apiKey = '8b5312ebb4064a6b9b105c5904457996';
    const apiUrl = `https://newsapi.org/v2/everything?q=mascotas&language=es&sortBy=publishedAt&apiKey=${apiKey}`;

    console.log('Llamando a la API:', apiUrl);

    this.http.get(apiUrl).subscribe({
      next: (data: any) => {
        console.log('Datos recibidos de la API:', data);
        if (data.articles && data.articles.length > 0) {
          this.anuncios = data.articles.map((articulo: any) => ({
            titulo: articulo.title,
            descripcion: articulo.description,
            url: articulo.url,
            imagen: articulo.urlToImage || 'assets/icon/favicon.png',
          }));
          console.log('Anuncios procesados:', this.anuncios);
        } else {
          console.error('No se encontraron artículos en la respuesta de la API.');
        }
      },
      error: (err) => {
        console.error('Error al obtener anuncios:', err);
        alert('No se pudieron cargar los anuncios.');
      },
    });
  }
}
