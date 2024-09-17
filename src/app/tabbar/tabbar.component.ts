import { Component } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-tabbar',
  standalone: true,
  imports: [MatButtonModule, MatTabsModule, MatIconModule, AsyncPipe],
  templateUrl: './tabbar.component.html',
  styleUrl: './tabbar.component.css',
})
export class TabbarComponent {
  asyncTabs: Observable<any>;
  constructor() {
    this.asyncTabs = new Observable((observer: Observer<any>) => {
      setTimeout(() => {
        observer.next([
          { label: 'First', content: 'Content 1' },
          { label: 'Second', content: 'Content 2' },
          { label: 'Third', content: 'Content 3' },
        ]);
      }, 1000);
    });
  }
}
