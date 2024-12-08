import { Component, OnInit } from '@angular/core'; // Importa OnInit
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.page.html',
  styleUrls: ['./registrarse.page.scss'],
})
export class RegistrarsePage implements OnInit {
  datosUsuario = {
    nombre: '',
    apellido: '',
    usuario: '',
    email: '',
    password: '',
    nivelEducacion: '',
    fechaNacimiento: '',
  };

  constructor(
    private dataService: DataService,
    private router: Router,
    private alertController: AlertController,
    private menuCtrl: MenuController
  ) {}

  // Desactivar el menú lateral al cargar la página
  ngOnInit() {
    this.menuCtrl.enable(false); // Desactiva el menú lateral
  }

  // Método para registrar usuarios
  async registrarse() {
    const { nombre, apellido, usuario, email, password, nivelEducacion, fechaNacimiento } = this.datosUsuario;

    // Validación de campos obligatorios
    if (!nombre || !apellido || !usuario || !email || !password) {
      this.mostrarAlerta('Error', 'Por favor complete todos los campos obligatorios.');
      return;
    }

    // Validación de longitud y caracteres válidos en el usuario
    if (usuario.length < 3 || usuario.length > 20) {
      this.mostrarAlerta('Error', 'El nombre de usuario debe tener entre 3 y 20 caracteres.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(usuario)) {
      this.mostrarAlerta('Error', 'El nombre de usuario solo puede contener letras, números y guiones bajos.');
      return;
    }

    // Validación del formato del correo electrónico
    if (!this.validarEmail(email)) {
      this.mostrarAlerta('Error', 'El correo electrónico no es válido. Verifique e intente nuevamente.');
      return;
    }

    // Validación de contraseña
    if (!this.validarPassword(password)) {
      this.mostrarAlerta(
        'Error',
        'La contraseña debe tener al menos 6 caracteres, incluir una letra mayúscula, un número y opcionalmente un carácter especial.'
      );
      return;
    }

    // Validación de fecha de nacimiento
    if (!this.validarFechaNacimiento(fechaNacimiento)) {
      this.mostrarAlerta('Error', 'La fecha de nacimiento no es válida o es una fecha futura.');
      return;
    }

    try {
      console.log('Intentando registrar usuario:', this.datosUsuario);

      const registrado = await this.dataService.registerUser(
        nombre,
        apellido,
        usuario,
        email,
        password,
        nivelEducacion,
        fechaNacimiento
      );

      console.log('Resultado de registro:', registrado);

      if (registrado) {
        // Guardar información en localStorage
        localStorage.setItem(
          'usuarioLogeado',
          JSON.stringify({ ...this.datosUsuario, isLoggedIn: true })
        );

        // Redirigir a home
        console.log('Registro exitoso, redirigiendo a home...');
        this.router.navigate(['/home']);
      } else {
        console.log('Registro fallido, no se pudo registrar el usuario.');
        this.mostrarAlerta('Error', 'No se pudo registrar el usuario. Inténtelo nuevamente.');
      }
    } catch (error) {
      console.error('Error en el registro:', error);
      const errorMessage = (error as any)?.message || 'Error desconocido';
      if (errorMessage.includes('ya está registrado')) {
        this.mostrarAlerta('Error', 'El usuario o el correo ya están registrados. Intente con otros.');
      } else {
        this.mostrarAlerta('Error', 'Error en registro: ' + errorMessage);
      }
    }
  }

  // Método para validar contraseñas
  private validarPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/; // Expresión regular para validar contraseña
    return passwordRegex.test(password);
  }

  // Método para validar correos electrónicos
  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar correo
    return emailRegex.test(email);
  }

  // Método para validar la fecha de nacimiento
  private validarFechaNacimiento(fechaNacimiento: string): boolean {
    const fecha = new Date(fechaNacimiento);
    return !isNaN(fecha.getTime()) && fecha <= new Date(); // La fecha debe ser válida y no futura
  }

  // Método para mostrar alertas
  private async mostrarAlerta(titulo: string, mensaje: string) {
    try {
      const alert = await this.alertController.create({
        header: titulo,
        message: mensaje,
        buttons: ['OK'],
      });
      await alert.present();
    } catch (error) {
      console.error('Error al mostrar alerta:', error);
    }
  }
}
