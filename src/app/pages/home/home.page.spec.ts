import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { HomePage } from './home.page';
import { DataService } from '../../services/data.service';
import { Geolocation, GeolocationPosition } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let dataServiceSpy: jasmine.SpyObj<DataService>;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    const dataServiceMock = jasmine.createSpyObj('DataService', ['getUserData', 'updateUserData']);
    const httpMock = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: DataService, useValue: dataServiceMock },
        { provide: HttpClient, useValue: httpMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    dataServiceSpy = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    fixture.detectChanges();
  });

  it('debería cargar datos de usuario correctamente', fakeAsync(() => {
    const mockUserData = { nombre: 'Usuario Test', email: 'usuario@test.com' };
    localStorage.setItem('usuarioLogeado', JSON.stringify({ usuario: 'UsuarioTest' }));

    // Cambiar a Promise.resolve
    dataServiceSpy.getUserData.and.returnValue(Promise.resolve(mockUserData));

    component.cargarDatosUsuario();
    tick();

    expect(dataServiceSpy.getUserData).toHaveBeenCalledWith('UsuarioTest');
    expect(component.usuarioLogeado).toEqual(mockUserData);
  }));

  it('debería manejar errores al cargar datos de usuario', fakeAsync(() => {
    localStorage.setItem('usuarioLogeado', JSON.stringify({ usuario: 'UsuarioTest' }));

    // Cambiar a Promise.reject
    dataServiceSpy.getUserData.and.returnValue(Promise.reject(new Error('Error al cargar datos')));
    const consoleSpy = spyOn(console, 'error');

    component.cargarDatosUsuario();
    tick();

    expect(dataServiceSpy.getUserData).toHaveBeenCalledWith('UsuarioTest');
    expect(consoleSpy).toHaveBeenCalledWith('Error al cargar datos del usuario:', jasmine.any(Error));
    expect(component.usuarioLogeado).toEqual({});
  }));

  it('debería actualizar datos del usuario correctamente', fakeAsync(() => {
    component.usuarioLogeado = { nombre: 'Usuario Actualizado' };

    // Cambiar a Promise.resolve
    dataServiceSpy.updateUserData.and.returnValue(Promise.resolve(true));
    component.guardarDatos();
    tick();

    expect(dataServiceSpy.updateUserData).toHaveBeenCalledWith(component.usuarioLogeado);
  }));

  it('debería manejar errores al actualizar datos del usuario', fakeAsync(() => {
    component.usuarioLogeado = { nombre: 'Usuario Erroneo' };

    // Cambiar a Promise.reject
    dataServiceSpy.updateUserData.and.returnValue(Promise.reject(new Error('Error al guardar datos')));
    const alertSpy = spyOn(window, 'alert');

    component.guardarDatos();
    tick();

    expect(dataServiceSpy.updateUserData).toHaveBeenCalledWith(component.usuarioLogeado);
    expect(alertSpy).toHaveBeenCalledWith('Hubo un error al intentar guardar los cambios.');
  }));
});
