import { Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkThemeSubject = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkThemeSubject.asObservable();
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.add('light-mode');
    }
  }
  toggleTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const newValue = !this.isDarkThemeSubject.value;
      this.isDarkThemeSubject.next(newValue);
      document.body.classList.toggle('dark-mode', newValue);
      document.body.classList.toggle('light-mode', !newValue);
    }
  }
}
