import { Component } from '@angular/core';
import { IndicadorService } from '../services/indicador/indicadorservices.service';
import { NavController, Platform, ToastController } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage {
  indicators: { nombre: string; valor: number; unidad: string }[] = []; // Variable para almacenar los nombres, valores y unidades de los indicadores

  backButtonPressedOnce: boolean = false;

  constructor(
    private indicadorService: IndicadorService,
    private navCtrl: NavController,
    private platform: Platform,
    private toastController: ToastController
  ) {}

  async ionViewWillEnter() {
    this.loadIndicators();
  }

  ionViewDidEnter() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      // Verificar si se ha presionado el botón de retroceso una vez
      if (this.backButtonPressedOnce) {
        App.exitApp();
      } else {
        // Mostrar mensaje de "Presione nuevamente para salir"
        this.presentToast('Presione nuevamente para salir');

        // Establecer el valor de backButtonPressedOnce a true
        this.backButtonPressedOnce = true;

        // Restablecer backButtonPressedOnce después de 2 segundos
        setTimeout(() => {
          this.backButtonPressedOnce = false;
        }, 2000);
      }
    });
  }

  async loadIndicators() {
    try {
      const dailyIndicators = await this.indicadorService.getRecords();
      console.log('Datos recibidos:', dailyIndicators);

      // Iterar sobre las claves del objeto dailyIndicators
      Object.keys(dailyIndicators).forEach((key) => {
        if (key !== 'version' && key !== 'autor' && key !== 'fecha') {
          const indicator = dailyIndicators[key];
          const nombre = this.obtenerTextoEntreParentesis(indicator.nombre); // Obtener el texto entre paréntesis
          const nombreIndicador = nombre !== '' ? nombre : indicator.nombre; // Usar el nombre entre paréntesis si existe, de lo contrario, usar el nombre completo
          const unidad = this.obtenerSimboloUnidad(indicator.unidad_medida); // Obtener el símbolo de la unidad
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

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      cssClass: 'custom-toast',
      color: 'dark',
    });

    toast.present();
  }

  obtenerTextoEntreParentesis(texto: string): string {
    const regex = /\((.*?)\)/; // Expresión regular para capturar el texto entre paréntesis
    const matches = regex.exec(texto);
    return matches ? matches[1] : ''; // Devuelve el texto capturado o una cadena vacía si no se encuentra ninguna coincidencia
  }

  obtenerSimboloUnidad(unidad: string): string {
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
}
