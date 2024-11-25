import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController } from '@ionic/angular'; // Importar MenuController
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-ingresar',
  templateUrl: './ingresar.page.html',
  styleUrls: ['./ingresar.page.scss'],
})
export class IngresarPage implements OnInit {
  datosUsuario = {
    usuario: '',
    password: '',
  };

  constructor(
    private dataService: DataService,
    private router: Router,
    private alertController: AlertController,
    private menuCtrl: MenuController // Agregar MenuController
  ) {}

  ngOnInit() {
    // Desactivar el menú lateral al cargar la página
    this.menuCtrl.enable(false);
  }

  ionViewWillLeave() {
    // Reactivar el menú lateral al salir de la página
    this.menuCtrl.enable(true);
  }

  async ingresar() {
    const { usuario, password } = this.datosUsuario;

    if (!usuario || !password) {
      this.mostrarAlerta('Error', 'Por favor ingrese su usuario y contraseña.');
      return;
    }

    try {
      // Verificar credenciales en SQLite
      const loggedIn = await this.dataService.loginUser(usuario, password);

      if (loggedIn) {
        // Guardar información en localStorage
        localStorage.setItem(
          'usuarioLogeado',
          JSON.stringify({ usuario, isLoggedIn: true })
        );

        // Redirigir a home
        console.log('Inicio de sesión exitoso, redirigiendo a home...');
        this.router.navigate(['/home']);
      } else {
        this.mostrarAlerta('Error', 'Usuario o contraseña incorrectos.');
      }
    } catch (error) {
      this.mostrarAlerta('Error', 'Hubo un problema al intentar ingresar.');
      console.error('Error en el inicio de sesión:', error);
    }
  }

  async logout() {
    // Mostrar confirmación de cierre de sesión
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          handler: () => {
            // Limpiar localStorage y redirigir al login
            localStorage.removeItem('usuarioLogeado');
            console.log('Sesión cerrada, redirigiendo a ingresar...');
            this.router.navigate(['/ingresar']);
          },
        },
      ],
    });

    await alert.present();
  }

  private async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  ionViewWillEnter() {
    // Verificar si el usuario ya está logeado
    const usuarioLogeado = localStorage.getItem('usuarioLogeado');
    if (usuarioLogeado) {
      const usuario = JSON.parse(usuarioLogeado);
      if (usuario.isLoggedIn) {
        console.log('Usuario ya logeado, redirigiendo a home...');
        this.router.navigate(['/home']);
      }
    }
  }
}
