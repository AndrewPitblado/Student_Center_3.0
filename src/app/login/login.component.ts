import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../NavBar/navbar.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {}
