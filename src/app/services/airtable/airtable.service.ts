import { Injectable } from '@angular/core';
import axios from 'axios';
import { Comentario } from '../../interface/vernoticia.interface';

@Injectable({
  providedIn: 'root',
})
export class AirtableService {
  private apiKey: string = 'YOUR_API_KEY';
  private baseId: string = 'YOUR_BASE_ID';
  private baseUrl: string = `https://api.airtable.com/v0/${this.baseId}`;

  constructor() {}

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async getRecords(tableName: string): Promise<any> {
    const url = `${this.baseUrl}/${tableName}`;
    const headers = this.getHeaders();

    try {
      const response = await axios.get(url, { headers });
      return response.data.records;
    } catch (error) {
      console.error('Error retrieving records from Airtable:', error);
      throw error;
    }
  }

  async getRecordById(tableName: string, id: string): Promise<any> {
    const url = `${this.baseUrl}/${tableName}/${id}`;
    const headers = this.getHeaders();

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error('Error retrieving record from Airtable:', error);
      throw error;
    }
  }

  async createComentario(
    noticiaId: string,
    comentario: Comentario
  ): Promise<any> {
    const url = `${this.baseUrl}/Comentarios`;
    const headers = this.getHeaders();

    const data = {
      records: [
        {
          fields: {
            comentario: comentario.comentario,
            noticias: [noticiaId],
            usuario: comentario.usuario,
          },
        },
      ],
    };

    try {
      const response = await axios.post(url, data, { headers });
      return response.data;
    } catch (error) {
      console.error('Error creating comentario in Airtable:', error);
      throw error;
    }
  }
}
