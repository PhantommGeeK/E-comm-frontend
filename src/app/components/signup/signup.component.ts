import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  username = '';
  password = '';
  confirmPassword = '';
  submitted = false;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;

    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Username and password are required.';
      return;
    }

    if (this.username.trim().length < 3) {
      this.errorMessage = 'Username must be at least 3 characters.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.authService.signup({ username: this.username.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Signup failed. Try another username.';
      }
    });
  }
}