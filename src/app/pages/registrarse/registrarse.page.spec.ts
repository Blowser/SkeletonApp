
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarsePage } from './registrarse.page';
import { AlertController, IonicModule, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('Página de Registrarse', () => {
  let componente: RegistrarsePage;
  let fixture: ComponentFixture<RegistrarsePage>;
  let servicioDatosMock: any;
  let controladorAlertasMock: any;
  let controladorMenuMock: any;
  let enrutadorMock: any;

  beforeEach(() => {
    servicioDatosMock = {
      registerUser: jasmine.createSpy('registerUser').and.returnValue(of(true)),
    };
    controladorAlertasMock = {
      create: jasmine.createSpy('create').and.callFake(() => Promise.resolve({ present: jasmine.createSpy('present') })),
    };
    controladorMenuMock = {
      enable: jasmine.createSpy('enable'),
    };
    enrutadorMock = {
      navigate: jasmine.createSpy('navigate'),
    };

    TestBed.configureTestingModule({
      declarations: [RegistrarsePage],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: DataService, useValue: servicioDatosMock },
        { provide: AlertController, useValue: controladorAlertasMock },
        { provide: MenuController, useValue: controladorMenuMock },
        { provide: Router, useValue: enrutadorMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarsePage);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(componente).toBeTruthy();
  });

  it('debería desactivar el menú al inicializarse', () => {
    expect(controladorMenuMock.enable).toHaveBeenCalledWith(false);
  });

  it('debería validar correctamente el formato del correo', () => {
    expect(componente['validarEmail']('test@example.com')).toBeTrue();
    expect(componente['validarEmail']('correo-invalido')).toBeFalse();
  });

  it('debería validar correctamente la fortaleza de la contraseña', () => {
    expect(componente['validarPassword']('Fuerte1')).toBeTrue();
    expect(componente['validarPassword']('débil')).toBeFalse();
  });

  it('debería validar correctamente la fecha de nacimiento', () => {
    expect(componente['validarFechaNacimiento']('2000-01-01')).toBeTrue();
    expect(componente['validarFechaNacimiento']('3000-01-01')).toBeFalse();
  });

  it('debería mostrar una alerta si faltan campos obligatorios', async () => {
    componente.datosUsuario = { nombre: '', apellido: '', usuario: '', email: '', password: '', nivelEducacion: '', fechaNacimiento: '' };
    await componente.registrarse();
    expect(controladorAlertasMock.create).toHaveBeenCalledWith(jasmine.objectContaining({ header: 'Error' }));
  });

  it('debería llamar a registerUser del servicio de datos en un registro exitoso', async () => {
    componente.datosUsuario = {
      nombre: 'Test',
      apellido: 'Usuario',
      usuario: 'testusuario',
      email: 'test@example.com',
      password: 'Fuerte1',
      nivelEducacion: 'Bachillerato',
      fechaNacimiento: '2000-01-01',
    };
    await componente.registrarse();
    expect(servicioDatosMock.registerUser).toHaveBeenCalledWith(
      'Test',
      'Usuario',
      'testusuario',
      'test@example.com',
      'Fuerte1',
      'Bachillerato',
      '2000-01-01'
    );
  });

  it('debería navegar a /home en un registro exitoso', async () => {
    componente.datosUsuario = {
      nombre: 'Test',
      apellido: 'Usuario',
      usuario: 'testusuario',
      email: 'test@example.com',
      password: 'Fuerte1',
      nivelEducacion: 'Bachillerato',
      fechaNacimiento: '2000-01-01',
    };
    await componente.registrarse();
    expect(enrutadorMock.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('debería mostrar una alerta si el registro falla', async () => {
    servicioDatosMock.registerUser.and.returnValue(of(false));
    componente.datosUsuario = {
      nombre: 'Test',
      apellido: 'Usuario',
      usuario: 'testusuario',
      email: 'test@example.com',
      password: 'Fuerte1',
      nivelEducacion: 'Bachillerato',
      fechaNacimiento: '2000-01-01',
    };
    await componente.registrarse();
    expect(controladorAlertasMock.create).toHaveBeenCalledWith(jasmine.objectContaining({ header: 'Error' }));
  });
});
