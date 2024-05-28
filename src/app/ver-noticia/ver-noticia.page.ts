import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../services/theme/theme.service';
import { VerNoticia, Comentario } from '../interface/vernoticia.interface';
import { AirtableService } from '../services/airtable/airtable.service';
import { DatePipe } from '@angular/common';
import { LoadingController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Noticia } from '../interface/noticia.interface';
import Swiper, { Navigation, Pagination, SwiperOptions } from 'swiper';
import { text } from 'express';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-ver-noticia',
  templateUrl: './ver-noticia.page.html',
  styleUrls: ['./ver-noticia.page.scss'],
})
export class VerNoticiaPage implements OnInit, AfterViewInit {
  @ViewChild('swiper', { static: false }) swiper!: ElementRef;
  swiperInstance: Swiper | undefined;

  swiperOptions: SwiperOptions = {
    slidesPerView: 'auto',
    spaceBetween: 10,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  };

  constructor(
    public themeService: ThemeService,
    private route: ActivatedRoute,
    private router: Router,
    private airtableService: AirtableService,
    private datePipe: DatePipe,
    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.modoClaro = !this.themeService.isDarkMode();
    this.route.params.subscribe((params: { [key: string]: any }) => {
      this.noticiaId = params['id'];
      this.obtenerNoticiaPorId(this.noticiaId);
    });
  }

  ngAfterViewInit() {
    Swiper.use([Navigation, Pagination]);

    if (this.swiper && this.swiper.nativeElement) {
      this.swiperInstance = new Swiper(this.swiper.nativeElement, {
        ...this.swiperOptions,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          renderBullet: function (index: number, className: string) {
            return '<span class="' + className + '">' + (index + 1) + '</span>';
          },
        },
      });
    }
  }
  public modoClaro: boolean = true;
  fechaComentario: string | null = '2023-06-01T10:30:00.000Z'; // Ejemplo de fecha de comentario

  tiempoTranscurrido: string = ''; //
  noticiaId: string = '';
  noticia: VerNoticia | undefined;
  noticias: Noticia | undefined;
  currentSlide = 0;
  numParrafos: number = 0;

  swiperSlideChanged(e: any) {
    console.log('changed: ', e);
  }

  async obtenerNoticiaPorId(id: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos...',
      spinner: 'bubbles',
      cssClass: 'custom-loading',
      backdropDismiss: false,
      keyboardClose: false,
    });
    await loading.present();
    this.airtableService.getRecordById('Noticias', id).then(
      (data: any) => {
        const textoCompleto: string = data.fields.contenido.replace(
          /\n/g,
          '<br>'
        );
  
        function convertirNegrita(texto: string): string {
          return texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
  
        const contenidoFormateado = this.convertirEnlaces(textoCompleto);
  
        const galeriaUrls: string[] =
          data.fields.galeria?.map(
            (imagen: any) => imagen.thumbnails.large.url
          ) || [];
  
        // Obtener los campos de comentarios desde Airtable
        const comentariosIds: string[] = data.fields.comentarios_id || [];
        const comentariosTexto: string[] = data.fields.comentarios_co || [];
        const comentariosUsuarios: string[] =
          data.fields.comentarios_usuarios || [];
        const comentariosFechas: string[] = data.fields.comentarios_fecha || [];
  
        // Verificar si existen comentarios
        if (comentariosIds.length === 0) {
          // No hay comentarios, puedes mostrar un mensaje o realizar alguna acción en caso de que no haya comentarios
          console.log('No hay comentarios');
          loading.dismiss();
          this.noticias = {
            id: data.id,
            fields: {
              id: data.fields.id,
              fecha_publicacion: data.fields.fecha_publicacion,
              estado: data.fields.estado,
              titular: data.fields.titular,
              contenido: this.sanitizer.bypassSecurityTrustHtml(
                convertirNegrita(contenidoFormateado)
              ) as SafeHtml,
              galeria: galeriaUrls,
              autor: data.fields.autor,
              fecha_creacion: data.fields.fecha_creacion,
            },
          };
        }
  
        // Crear el arreglo de comentarios
        const comentarios: Comentario[] = comentariosIds.map(
          (id: string, index: number) => {
            const fechaFormateada = comentariosFechas[index]
              ? this.datePipe.transform(comentariosFechas[index], 'medium')
              : null;
            return {
              comentario: comentariosTexto[index],
              usuario: comentariosUsuarios[index],
              fecha: fechaFormateada,
            };
          }
        );
  
        // Agregar los comentarios a la interfaz VerNoticia
        this.noticia = {
          id: data.id,
          fields: {
            id: data.fields.id,
            fecha_publicacion: data.fields.fecha_publicacion,
            estado: data.fields.estado,
            titular: data.fields.titular,
            contenido: this.sanitizer.bypassSecurityTrustHtml(
              convertirNegrita(contenidoFormateado)
            ) as SafeHtml,
            galeria: galeriaUrls,
            autor: data.fields.autor,
            fecha_creacion: data.fields.fecha_creacion,
            comentarios: comentarios,
          },
        };
  
        console.log('ID de Airtable:', this.noticia);
        console.log('Url Galeria: ', galeriaUrls);
  
        console.log(this.noticia);
        loading.dismiss();
      },
      (error) => {
        console.error('Error al obtener la noticia:', error);
        loading.dismiss();
      }
    );
  }
  
  convertirEnlaces(texto: string): string {
    const regexEnlace = /\[([^[\]]+)\]\((https?:\/\/[^\s]+)\)/g;
    const contenidoFormateado = texto.replace(
      regexEnlace,
      '<a href="$2" target="_blank">$1</a>'
    );
    return contenidoFormateado;
  }
  contarParrafosReales(parrafos: string[]): number {
    let count = 0;

    for (const parrafo of parrafos) {
      if (parrafo.trim() !== '') {
        count++;
      }
    }

    return count;
  }

  regresar() {
    this.router.navigate(['/noticias']);
  }
  getBackgroundStyle(autor: string) {
    return {
      'background-color': '#302444',
      display: 'inline-block',
    };
  }

  enviarComentario() {
    const usuarioInput = document.querySelector(
      'ion-input[placeholder="Nombre de Usuario"]'
    ) as HTMLIonInputElement;
    const comentarioInput = document.querySelector(
      'ion-input[placeholder="Escribir un comentario...."]'
    ) as HTMLIonInputElement;

    if (usuarioInput && comentarioInput) {
      const usuario = String(usuarioInput.value).trim();
      const comentario = String(comentarioInput.value).trim();
      if (!usuario && !comentario) {
        this.mostrarToast('Falta el usuario y la contraseña');
      } else if (!usuario) {
        this.mostrarToast('Falta el usuario');
      } else if (!comentario) {
        this.mostrarToast('Falta la contraseña');
      } else {
        // Obtener el ID de la noticia
        const noticiaId = this.noticia?.id;

        // Crear el objeto de comentario
        const nuevoComentario: Comentario = {
          comentario: comentario,
          usuario: usuario,
          fecha: new Date().toISOString(),
        };

        // Enviar el comentario a la tabla de comentarios
        if (noticiaId) {
          this.airtableService
            .createComentario(noticiaId, nuevoComentario)
            .then(
              (data) => {
                console.log('Comentario enviado:', data);
                this.mostrarExito(
                  'Comentario enviado esperando aprobacion del moderador'
                );
                // Limpiar los campos de usuario y comentario
                usuarioInput.value = '';
                comentarioInput.value = '';
              },
              (error) => {
                this.mostrarError('Error al enviar el comentario: ' + error);
                console.error('Error al enviar el comentario:', error);
              }
            );
        } else {
          this.mostrarError('El ID de la noticia es indefinido.');
          console.error('El ID de la noticia es indefinido.');
        }
      }
    }
  }
  async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: 'danger',
    });
    toast.present();
  }
  async mostrarExito(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: 'primary',
    });
    toast.present();
  }
  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: 'warning', // Puedes ajustar el color según tus necesidades
    });
    toast.present();
  }
  getComentarioStyles() {
    if (this.themeService.isDarkMode()) {
      return {
        'background-color': 'rgba(51, 51, 51, 1)',
        color: 'rgba(242, 242, 242, 1)',
      };
    } else {
      return {
        'background-color': 'rgba(224, 224, 224, 1)',
        color: 'rgba(79, 79, 79, 1)',
      };
    }
  }
  getInputStyles() {
    if (this.themeService.isDarkMode()) {
      return {
        'background-color': 'rgba(21, 21, 21, 1)',
        color: 'rgba(242, 242, 242, 1)',
      };
    } else {
      return {
        'background-color': 'rgba(217, 217, 217, 1)',
        color: 'rgba(79, 79, 79, 1)',
      };
    }
  }

  getSendIconStyles() {
    if (this.themeService.isDarkMode()) {
      return {
        color: 'rgba(0, 0, 0, 1)',
      };
    } else {
      return {
        color: 'rgba(240, 240, 240, 1)',
      };
    }
  }
}
