import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserService } from '../services/user.service';
import { CreateUserDTO } from '../interface/user';
import { ValidationErrors } from '@angular/forms';
import { MatIcon, MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatIconModule,
  ],
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.css',
})
export class AddStudentComponent {
  hidePassword = true;
  userForm: FormGroup;
  constructor(private fb: FormBuilder, private userService: UserService) {
    this.userForm = this.fb.group({
      userNum: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      birthday: [
        '',
        [
          Validators.required,
          (control: AbstractControl): ValidationErrors | null => {
            const date = new Date(control.value);
            return date > new Date() ? { futureDate: true } : null;
          },
        ],
      ],
      socialInsuranceNum: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{9}$')],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@uwo.ca$'),
        ],
      ],
      phoneNum: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', [Validators.required, Validators.pattern('^[A-Z]{2}$')]],
      postalCode: [
        '',
        [
          Validators.required,
          Validators.pattern('^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$'),
        ],
      ],
      isAdmin: [false],
      userId: ['', [Validators.required, Validators.minLength(6)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
          ),
        ],
      ],
    });
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}/${month}/${day}`;
  }
  onSubmit() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      const birthdate = new Date(formData.birthday);
      if (birthdate > new Date()) {
        alert('Birthdate cannot be in the future');
        return;
      }
      formData.birthday = this.formatDate(birthdate);
      this.userService.createUser(formData).subscribe({
        next: (response) => {
          localStorage.setItem('pendingUserData', JSON.stringify(formData));
          console.log('User created successfully', formData);
          alert('User created successfully');
          this.userForm.reset();
        },
        error: (error) => {
          console.error('Error creating user', error);
        },
      });
    }
  }
}
