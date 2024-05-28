import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { ThemeService } from './services/theme/theme.service';

register();
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform: Platform, private themeService: ThemeService) {}
  ngOnInit() {
    this.platform.ready().then(() => {
      if (this.platform.is('ios') || this.platform.is('android')) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        if (mediaQuery.matches) {
          this.themeService.enableDarkMode();
        }

        mediaQuery.addEventListener('change', (event) => {
          if (event.matches) {
            this.themeService.enableDarkMode();
          } else {
            this.themeService.enableLightMode();
          }
        });
      }
    });
  }
}
