import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterModule } from '@angular/router';
import { CartService } from './services/cart.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'E-Commerce App';

  readonly cart$ = this.cartService.cart$;
  readonly authState$ = this.authService.authState$;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  get username(): string {
    return this.authService.getUsername() ?? 'User';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
