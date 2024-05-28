import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { AirtableService } from '../services/airtable/airtable.service';
import { DatePipe } from '@angular/common';
import { ThemeService } from '../services/theme/theme.service';
import { Taller } from '../interface/taller.interface';
import { LoadingController } from '@ionic/angular';
import { IndicadorService } from '../services/indicador/indicadorservices.service';

@Component({
  selector: 'app-talleres',
  templateUrl: './talleres.page.html',
  styleUrls: ['./talleres.page.scss'],
  providers: [DatePipe],
})
export class TalleresPage implements OnInit {
  modoClaro: boolean = false;
  imagenClaro: string;
  imagenOscuro: string;
  dailyIndicators: any; // Variable para almacenar los datos
  indicators: { nombre: string; valor: number; unidad: string }[] = []; // Variable para almacenar los nombres, valores y unidades de los indicadores
  talleres: Taller[] = [];

  constructor(
    private platform: Platform,
    private airtableService: AirtableService,
    private datePipe: DatePipe,
    public themeService: ThemeService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private indicadorService: IndicadorService
  ) {
    this.imagenClaro = '../../assets/image/IC_light.png';
    this.imagenOscuro = '../../assets/image/IC_dark.png';
  }
  async ionViewWillEnter() {
    await this.loadIndicators();
  }
  async ngOnInit() {
    this.modoClaro =
      this.platform.is('ios') ||
      this.platform.is('android') ||
      this.platform.is('mobileweb')
        ? window.matchMedia('(prefers-color-scheme: light)').matches
        : false;

    this.obtenerTalleres();
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.goBack();
    });
  }
  async doRefresh(event: any) {
    await Promise.all([this.obtenerTalleres(), this.loadIndicators()]);
  
    // Finalizar la animación de actualización
    event.target.complete();
  }
  async loadIndicators() {
    try {
      this.dailyIndicators = await this.indicadorService.getRecords();
      console.log('Datos recibidos:', this.dailyIndicators);

      // Iterar sobre las claves del objeto dailyIndicators
      Object.keys(this.dailyIndicators).forEach((key) => {
        if (key !== 'version' && key !== 'autor' && key !== 'fecha') {
          const indicator = this.dailyIndicators[key];
          const nombre = obtenerTextoEntreParentesis(indicator.nombre); // Obtener el texto entre paréntesis
          const nombreIndicador = nombre !== '' ? nombre : indicator.nombre; // Usar el nombre entre paréntesis si existe, de lo contrario, usar el nombre completo
          const unidad = obtenerSimboloUnidad(indicator.unidad_medida); // Obtener el símbolo de la unidad
          this.indicators.push({
            nombre: nombreIndicador,
            valor: indicator.valor,
            unidad: unidad,
          });
        }
      });

      console.log('Indicadores:', this.indicators);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  }

  goBack() {
    // Aquí puedes realizar las acciones necesarias antes de volver atrás, si las hay

    // Navega hacia atrás utilizando el enrutador
    this.navCtrl.navigateBack('/menu');
  }

  async obtenerTalleres() {
    const loading = await this.loadingCtrl.create({
      message: 'Buscando datos...',
      spinner: 'bubbles',
      cssClass: 'custom-loading',
      backdropDismiss: false,
      keyboardClose: false,
    });
    await loading.present();
    this.airtableService.getRecords('Talleres').then(
      (data: any[]) => {
        this.talleres = data.map((item) => ({
          id: item.id,
          fields: {
            id: item.fields.id,
            fecha_publicacion: item.fields.fecha_publicacion,
            estado: item.fields.estado,
            titular: item.fields.titular,
            contenido: item.fields.contenido,
            galeria: item.fields.imagen?.[0]?.thumbnails?.large?.url || '',
            autor: item.fields.autor,
            fecha_creacion: item.fields.fecha_creacion,
          },
        }));
        console.log(this.talleres);

        loading.dismiss();
      },
      (error) => {
        console.error('Error al obtener las talleres:', error);
        loading.dismiss();
      }
    );
  }

  recortarContenido(contenido: string): string {
    if (contenido.length > 200) {
      return contenido.substring(0, 200) + '...';
    }
    return contenido;
  }

  cambiarModo() {
    this.modoClaro = !this.modoClaro;
  }

}
function obtenerTextoEntreParentesis(texto: string): string {
  const regex = /\((.*?)\)/; // Expresión regular para capturar el texto entre paréntesis
  const matches = regex.exec(texto);
  return matches ? matches[1] : ''; // Devuelve el texto capturado o una cadena vacía si no se encuentra ninguna coincidencia
}

function obtenerSimboloUnidad(unidad: string): string {
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
