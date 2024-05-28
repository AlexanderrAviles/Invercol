import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private darkMode = false;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    this.updateTheme();
  }

  enableDarkMode(): void {
    this.darkMode = true;
    this.updateTheme();
  }

  enableLightMode(): void {
    this.darkMode = false;
    this.updateTheme();
  }

  private updateTheme(): void {
    const body = document.getElementsByTagName('body')[0];
    if (this.darkMode) {
      body.classList.add('dark-mode');
      this.renderer.addClass(body, 'dark-mode');
    } else {
      body.classList.remove('dark-mode');
      this.renderer.removeClass(body, 'dark-mode');
    }
  }
}
