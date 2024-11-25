import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';


@Injectable({
  providedIn: 'root',
})
export class DataService {
  public dbInstance!: SQLiteObject;

  constructor(private sqlite: SQLite) {}

  // Inicializa la base de datos y crea las tablas
  async initializeDatabase() {
    try {
      this.dbInstance = await this.sqlite.create({
        name: 'mydatabase1.db',
        location: 'default',
      });

      console.log('Base de datos inicializada.');
      await this.createTables();
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
    }
  }

  // Crea la tabla de usuarios si no existe
  private async createTables() {
    try {
      await this.dbInstance.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          nombre TEXT,
          apellido TEXT,
          usuario TEXT UNIQUE,
          email TEXT UNIQUE,
          password TEXT,
          nivel_educacion TEXT,
          fecha_nacimiento TEXT
        )`,
        []
      );
      console.log('Tabla users creada o ya existía.');
    } catch (error) {
      console.error('Error al crear las tablas:', error);
    }
  }

  // Registrar un nuevo usuario en la base de datos
  async registerUser(
    nombre: string,
    apellido: string,
    usuario: string,
    email: string,
    password: string,
    nivelEducacion: string,
    fechaNacimiento: string
  ): Promise<boolean> {
    try {
      console.log('Ejecutando consulta para registrar usuario.');
  
      await this.dbInstance.executeSql(
        `INSERT INTO users (nombre, apellido, usuario, email, password, nivel_educacion, fecha_nacimiento) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombre, apellido, usuario, email, password, nivelEducacion, fechaNacimiento]
      );
  
      console.log('Usuario registrado exitosamente en la base de datos.');
      return true;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return false;
    }
  }
  
  
  

  // Verificar credenciales de inicio de sesión
  async loginUser(usuario: string, password: string): Promise<boolean> {
    try {
      const result = await this.dbInstance.executeSql(
        `SELECT * FROM users WHERE usuario = ? AND password = ?`,
        [usuario, password]
      );

      // Si encuentra un registro, devuelve true
      if (result.rows.length > 0) {
        console.log('Usuario encontrado:', result.rows.item(0));
        return true;
      } else {
        console.log('Credenciales incorrectas.');
        return false;
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      return false;
    }
  }

  // Obtener todos los usuarios (para depuración o pruebas)
  async getAllUsers() {
    try {
      const result = await this.dbInstance.executeSql(`SELECT * FROM users`, []);
      const users = [];
      for (let i = 0; i < result.rows.length; i++) {
        users.push(result.rows.item(i));
      }
      console.log('Usuarios registrados:', users);
      return users;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }

async getUserData(usuario: string) {
  try {
    const result = await this.dbInstance.executeSql(
      `SELECT * FROM users WHERE usuario = ?`,
      [usuario]
    );

    if (result.rows.length > 0) {
      return result.rows.item(0); // Devuelve el primer registro encontrado
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
}
async updateUserData(data: any): Promise<boolean> {
  try {
    console.log('Actualizando datos en la base de datos:', data);

    await this.dbInstance.executeSql(
      `UPDATE users SET 
        nombre = ?, 
        apellido = ?, 
        email = ?, 
        password = ?, 
        nivel_educacion = ?, 
        fecha_nacimiento = ? 
      WHERE usuario = ?`,
      [
        data.nombre,
        data.apellido,
        data.email,
        data.password,
        data.nivelEducacion,
        data.fechaNacimiento,
        data.usuario,
      ]
    );

    console.log('Datos actualizados en la base de datos.');
    return true;
  } catch (error) {
    console.error('Error al actualizar los datos:', error);
    return false;
  }
}
}