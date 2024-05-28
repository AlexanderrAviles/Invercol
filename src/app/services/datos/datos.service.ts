import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DatosService {
  private datos: any; // Aquí puedes definir la estructura de datos que deseas almacenar

  constructor() {}

  setDatos(datos: any) {
    this.datos = datos;
  }

  getDatos() {
    return this.datos;
  }
}
