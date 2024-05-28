import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class IndicadorService {
  private baseUrl: string = 'https://mindicador.cl/api';

  constructor() {}

  async getRecords(): Promise<any> {
    const url = `${this.baseUrl}`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al consumir la API: ', error);
      throw error;
    }
  }

  async getIndicadores(): Promise<any[]> {
    const records = await this.getRecords();
    const indicadores: any[] = [];

    for (const key of Object.keys(records)) {
      if (key !== 'version' && key !== 'autor' && key !== 'fecha') {
        const indicator = records[key];
        const nombre = this.obtenerTextoEntreParentesis(indicator.nombre);
        const nombreIndicador = nombre !== '' ? nombre : indicator.nombre;
        const unidad = this.obtenerSimboloUnidad(indicator.unidad_medida);

        indicadores.push({
          nombre: nombreIndicador,
          valor: indicator.valor,
          unidad: unidad,
        });
      }
    }

    return indicadores;
  }

  private obtenerTextoEntreParentesis(texto: string): string {
    const regex = /\((.*?)\)/;
    const matches = regex.exec(texto);
    return matches ? matches[1] : '';
  }

  private obtenerSimboloUnidad(unidad: string): string {
    switch (unidad) {
      case 'Dólar':
        return 'USD';
      case 'Pesos':
        return 'CLP';
      case 'Porcentaje':
        return '%';
      default:
        return unidad;
    }
  }

  // async getRecordsByDate(code: string, date: string): Promise<any> {
  //   const url = `${this.baseUrl}/${code}/${date}`;

  //   try {
  //     const response = await axios.get(url);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error al obtener los indicadores para la fecha:', error);
  //     throw error;
  //   }
  // }
}
