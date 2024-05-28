import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  SecurityContext,
  ViewChild,
} from '@angular/core';
import { IonContent, MenuController, Platform, ScrollDetail } from '@ionic/angular';
import { AirtableService } from '../services/airtable/airtable.service';
import { Noticia } from '../interface/noticia.interface';
import { LoadingController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { IndicadorService } from '../services/indicador/indicadorservices.service';
import { DatePipe } from '@angular/common';
import { ThemeService } from '../services/theme/theme.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { log } from 'console';

@Component({
  selector: 'app-noticias',
  templateUrl: './noticias.page.html',
  styleUrls: ['./noticias.page.scss'],
  providers: [DatePipe],
})
export class NoticiasPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  showButton = false;
  cardThreshold = 3;
  @HostListener('window:scroll')
  scrollPosition: number = 0;
  modoClaro: boolean = false;
  imagenClaro: string;
  imagenOscuro: string;
  selectedAutor: string = '';
  autorSeleccionado: string = ''; // Autor seleccionado actualmente
  indicators: { nombre: string; valor: number; unidad: string }[] = []; // Variable para almacenar los nombres, valores y unidades de los indicadores
  autores: string[] = []; // Lista de autores disponibles
  dailyIndicators: any; // Variable para almacenar los datos
  noticias: any[] = [];
  noticiasTodas: any[] = [];

  constructor(
    private platform: Platform,
    private airtableService: AirtableService,
    private datePipe: DatePipe,
    public themeService: ThemeService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private indicadorService: IndicadorService,
    private sanitizer: DomSanitizer,
    private menuCtrl: MenuController
  ) {
    this.imagenClaro = '../../assets/image/IC_light.png';
    this.imagenOscuro = '../../assets/image/IC_dark.png';
  }
  async ionViewWillEnter() {
    await this.loadIndicators();
    this.selectedAutor = this.autorSeleccionado;

    await this.obtenerNoticias();
  }

  onContentScroll(event: Event) {
    const scrollElement = event.target as HTMLElement;
    const scrollPosition = scrollElement.scrollTop;

    const cardIndex = this.cardThreshold - 1;
    const cardElements = document.getElementsByClassName('card-element');
    const cardPosition = cardElements[cardIndex].getBoundingClientRect().top;

    this.showButton = scrollPosition >= cardPosition;
    console.log('Scroll Position:', scrollPosition);
    console.log('Card Position:', cardPosition);
    console.log('Show Button:', this.showButton);
  }

  async ngOnInit() {
    // this.modoClaro = this.themeService.isDarkMode();

    this.obtenerNoticias();
    this.platform.backButton.subscribeWithPriority(0, () => {
      this.goBack();
    });
  }

  ngDoCheck() {
    this.actualizarModoClaro();
  }

  actualizarModoClaro() {
    this.modoClaro =
      this.platform.is('ios') ||
      this.platform.is('android') ||
      this.platform.is('mobileweb')
        ? window.matchMedia('(prefers-color-scheme: light)').matches
        : false;
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

  scrollToTop() {
    const contentElement = document.getElementById('content');
    if (contentElement) {
      contentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  async doRefresh(event: any) {
    await this.obtenerNoticias();

    if (this.selectedAutor !== '') {
      // Volver a filtrar las noticias por el autor seleccionado anteriormente
      this.noticias = this.noticias.filter(
        (noticia) => noticia.fields.autor === this.selectedAutor
      );
    }

    // Finalizar la animación de actualización
    event.target.complete();
  }

  async obtenerNoticias() {
    const loading = await this.loadingCtrl.create({
      message: 'Buscando datos...',
      spinner: 'bubbles',
      cssClass: 'custom-loading',
      backdropDismiss: false,
      keyboardClose: false,
    });
    await loading.present();
  
    const autorFiltrar = this.selectedAutor; // Guardar el autor seleccionado actualmente
  
    this.airtableService.getRecords('Noticias').then(
      (data: any[]) => {
        this.noticiasTodas = data
          .filter((item) => item.fields.estado === 'Publicada')
          .map((item) => ({
            id: item.id,
            fields: {
              id: item.fields.id,
              fecha_publicacion: item.fields.fecha_publicacion,
              estado: item.fields.estado,
              titular: item.fields.titular,
              contenido: this.removerFormatoELinks(item.fields.contenido),
              galeria: item.fields.galeria?.[0]?.thumbnails?.large?.url || '',
              autor: item.fields.autor,
              fecha_creacion: item.fields.fecha_creacion,
            },
          }))
          .sort((a, b) => {
            return (
              new Date(b.fields.fecha_publicacion).getTime() -
              new Date(a.fields.fecha_publicacion).getTime()
            );
          });
  
        if (autorFiltrar === '') {
          // No se ha seleccionado ningún autor, mostrar todas las noticias
          this.noticias = this.noticiasTodas;
        } else {
          // Filtrar las noticias por el autor seleccionado
          this.noticias = this.noticiasTodas.filter(
            (noticia) => noticia.fields.autor === autorFiltrar
          );
        }
  
        // Obtener los autores de las noticias y ordenar alfabéticamente
        this.autores = Array.from(
          new Set(this.noticiasTodas.map((noticia) => noticia.fields.autor))
        ).sort();
  
        loading.dismiss();
      },
      (error: any) => {
        console.error('Error al obtener las noticias:', error);
        loading.dismiss();
      }
    );
  }
  

  filtrarPorAutor(autor?: string) {
    // Resto de la lógica de filtrado
    if (autor === undefined || autor === '') {
      // No se ha seleccionado ningún autor, mostrar todas las noticias
      this.obtenerNoticias();
    } else {
      // Filtrar las noticias por el autor seleccionado
      this.airtableService.getRecords('Noticias').then(
        (data: any[]) => {
          this.noticias = data
            .filter(
              (item) =>
                item.fields.estado === 'Publicada' &&
                item.fields.autor === autor
            )
            .map((item) => ({
              id: item.id,
              fields: {
                id: item.fields.id,
                fecha_publicacion: item.fields.fecha_publicacion,
                estado: item.fields.estado,
                titular: item.fields.titular,
                contenido: this.removerFormatoELinks(item.fields.contenido),
                galeria: item.fields.galeria?.[0]?.thumbnails?.large?.url || '',
                autor: item.fields.autor,
                fecha_creacion: item.fields.fecha_creacion,
              },
            }))
            .sort((a, b) => {
              // Ordenar las noticias por fecha de publicación
              return (
                new Date(b.fields.fecha_publicacion).getTime() -
                new Date(a.fields.fecha_publicacion).getTime()
              );
            });
        },
        (error: any) => {
          console.error('Error al obtener las noticias:', error);
        }
      );
    }
    this.menuCtrl.close('first');
  }
  removerFormatoELinks(texto: string): string {
    const regexTags = /(<([^>]+)>)/gi; // Expresión regular para eliminar las etiquetas HTML
    const regexLinks = /\[([^[]+)\]\(([^)]+)\)/g; // Expresión regular para eliminar los links en formato [texto](url)
    const regexNegrita = /\*\*(.*?)\*\*/g; // Expresión regular para eliminar el formato de negrita (**texto**)

    // Eliminar las etiquetas HTML
    const textoSinTags = texto.replace(regexTags, '');

    // Eliminar los links
    const textoSinLinks = textoSinTags.replace(regexLinks, '$1');

    // Eliminar el formato de negrita
    const textoSinNegrita = textoSinLinks.replace(regexNegrita, '$1');

    return textoSinNegrita;
  }

  recortarContenido(contenido: string): any {
    const contenidoRecortado = contenido.substring(0, 200);
    return this.sanitizer.bypassSecurityTrustHtml(contenidoRecortado);
  }

  cambiarModo() {
    this.modoClaro = !this.modoClaro;
  }

  getBackgroundStyle(autor: string) {
    return {
      'background-color': '#302444',
      display: 'inline-block',
    };
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
