import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { NavController, Platform, ToastController } from '@ionic/angular';
import { DatosService } from '../services/datos/datos.service';
import { IndicadorService } from '../services/indicador/indicadorservices.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;
  backButtonPressedOnce: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private router: Router,
    private toastController: ToastController,
    private navCtrl: NavController,
    private platform: Platform,
    private datosService: DatosService,
    private indicadorService: IndicadorService,
  ) {}

  onInputFocus(event: any) {
    const labels = this.elementRef.nativeElement.querySelectorAll('ion-label');
    labels.forEach((label: any) => {
      label.style.color = 'rgb(98, 24, 37)';
    });

    const inputElement =
      this.elementRef.nativeElement.querySelector('ion-input');
    inputElement.style.borderColor = 'rgb(98, 24, 37)';
    inputElement.classList.add('input-focused');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: 'danger',
    });
    toast.present();
  }

  ngOnInit() {}

  ionViewDidEnter() {
    this.navCtrl.navigateRoot('/login'); // Reemplaza '/login' con la ruta de tu página de inicio de sesión actual
    this.registerBackButtonListener();
  }

  registerBackButtonListener() {
    this.platform.backButton.subscribeWithPriority(0, () => {
      if (this.router.url === '/login') {
        if (this.backButtonPressedOnce) {
          App.exitApp(); // Cierra la aplicación
        } else {
          this.presentToast();
          this.backButtonPressedOnce = true;
          setTimeout(() => {
            this.backButtonPressedOnce = false;
          }, 2000);
        }
      }
    });
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Presione nuevamente para salir',
      duration: 2000,
      position: 'bottom',
      color: 'dark',
    });
    toast.present();
  }

  async login() {
    // console.log('Usuario:', this.username);
    // console.log('Contraseña:', this.password);

    // Verificar las credenciales ingresadas
    if (this.username === 'admin' && this.password === 'admin') {
      // Credenciales válidas, navegar al menú
      this.router.navigate(['/menu']);
    } else {
      // Credenciales inválidas, mostrar mensaje de error
      this.mostrarError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
    }
    try {
      const indicadores = await this.indicadorService.getIndicadores();
      this.datosService.setDatos(indicadores);
    } catch (error) {
      console.error('Error al obtener los indicadores:', error);
    }
  }
}
