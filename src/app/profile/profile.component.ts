import { Component, ViewChild, OnInit } from '@angular/core';
import { NavbarComponent } from '../NavBar/navbar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { User } from '../interface/auth.types';
import { ReactiveFormsModule } from '@angular/forms';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { Observable } from 'rxjs';
import { ThemeService } from '../services/theme.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NavbarComponent,
    MatTableModule,
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    ReactiveFormsModule,
    CdkAccordionModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  @ViewChild('myaccordion') accordion!: MatAccordion;
  userProfile?: User;
  profileForm: FormGroup;
  isEditing: boolean[] = [];
  isDarkMode$: Observable<boolean>;

  constructor(
    public authService: AuthService,
    private themeService: ThemeService,
    private datePipe: DatePipe,

    private router: Router,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [''],
      birthday: ['', Validators.required],
      socialInsuranceNum: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNum: ['', Validators.required],
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      postalCode: ['', Validators.required],
    });
    this.isDarkMode$ = this.themeService.isDarkTheme$;
  }

  ngOnInit(): void {
    const userNum = Number(localStorage.getItem('userNum'));
    console.log('Attempting to fetch user profile with userNum:', userNum);

    if (!userNum) {
      console.error('No userNum found in localStorage');
      this.router.navigate(['/login']);
      return;
    }
    if (userNum) {
      this.authService.getUserProfile(userNum).subscribe({
        next: (user) => {
          this.userProfile = user;
          const formValue = {
            ...user,
            birthday: user.birthday
              ? new Date(user.birthday.split('/').reverse().join('-'))
              : '',
          };
          this.profileForm.patchValue(formValue);
        },
        error: (error) => console.error('Error fetching user profile:', error),
      });
    }
  }
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout(): void {
    console.log('Profile component initiating logout');
    this.authService.logout();

    console.log('Logout successful, navigating to login');
    this.router.navigate(['/login']);

    // Still redirect on error since local state is cleared
    this.router.navigate(['/login']);
  }

  onSubmit(panelIndex: number): void {
    if (this.profileForm.valid && this.userProfile) {
      console.log(
        'Form Submitted, current form value:',
        this.profileForm.value
      );
      const formattedBirthday = this.datePipe.transform(
        this.profileForm.value.birthday,
        'yyyy/MM/dd'
      );
      const userData: User = {
        ...this.userProfile,
        ...this.profileForm.value,
        birthday: formattedBirthday,
        userNum: this.userProfile.userNum,
        isAdmin: this.userProfile.isAdmin,
      };

      console.log('Updating user profile with data:', userData);
      this.authService.updateProfile(userData).subscribe({
        next: (updatedUser) => {
          console.log('Profile updated successfully:', updatedUser);
          this.userProfile = updatedUser;
          this.isEditing[panelIndex] = false;
        },
        error: (error) => console.error('Error updating profile:', error),
      });
      this.isEditing[panelIndex] = false;
    }
  }
  cancelEdit(panelIndex: number): void {
    this.isEditing[panelIndex] = false;
    this.profileForm.patchValue(this.userProfile || {});
  }
  expandAll(): void {
    this.accordion.openAll();
  }
  collapseAll(): void {
    this.accordion.closeAll();
  }
}
