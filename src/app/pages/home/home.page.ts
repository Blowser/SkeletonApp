import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
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
  selectedSegment: string = 'anuncios';
  usuarioLogeado: any = {};
  map: any;
  mascotasPerdidas: ReporteMascota[] = [];
  currentPosition: { latitude: number; longitude: number } | null = null;
  anuncios: any[] = [];

  constructor(
    private menuCtrl: MenuController,
    private router: Router,
    private dataService: DataService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.menuCtrl.enable(true);
    this.cargarDatosUsuario();
    if (this.selectedSegment === 'anuncios') {
      this.obtenerAnuncios();
    }
  }

  async ngAfterViewInit() {
    if (this.selectedSegment === 'mapa') {
      await this.initMap();
    }
  }

  async segmentChanged(event: any) {
    const segment = event.detail.value;
    console.log('Segmento cambiado a:', segment);

    if (segment === 'anuncios') {
      this.obtenerAnuncios();
    } else if (segment === 'mis-datos') {
      await this.cargarDatosUsuario();
    } else if (segment === 'mapa') {
      await this.initMap(); // Reinicia el mapa cada vez que se accede al segmento
    }
  }

  async initMap() {
    try {
      // Si el mapa ya existe, lo limpiamos
      if (this.map) {
        this.map.remove();
        this.map = null;
        console.log('Mapa reiniciado.');
      }

      // Obtenemos la ubicación actual
      const position = await Geolocation.getCurrentPosition();
      this.currentPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Inicializamos el mapa
      this.map = L.map('map').setView(
        [this.currentPosition.latitude, this.currentPosition.longitude],
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

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
        L.marker([lat, lng])
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
        if (data.articles && data.articles.length > 0) {
          this.anuncios = data.articles.map((articulo: any) => ({
            titulo: articulo.title,
            descripcion: articulo.description,
            url: articulo.url,
            imagen: articulo.urlToImage || 'assets/icon/favicon.png',
          }));
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
