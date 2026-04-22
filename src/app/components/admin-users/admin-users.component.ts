import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminUserService } from '../../services/admin-user.service';
import { ManagedUser } from '../../model/ManagedUser';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: ManagedUser[] = [];
  loading = false;
  savingUserId: number | null = null;
  message: string | null = null;
  errorMessage: string | null = null;

  constructor(private adminUserService: AdminUserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = null;

    this.adminUserService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Unable to load users right now.';
      }
    });
  }

  saveRole(user: ManagedUser, nextRole: string): void {
    if (user.role === nextRole) {
      return;
    }

    this.savingUserId = user.id;
    this.message = null;
    this.errorMessage = null;

    this.adminUserService.updateUserRole(user.id, nextRole).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map((item) => (item.id === updatedUser.id ? updatedUser : item));
        this.message = `${updatedUser.username} updated to ${updatedUser.role}`;
        this.savingUserId = null;
      },
      error: (error) => {
        this.savingUserId = null;
        this.errorMessage = error?.error?.message || 'Role update failed.';
      }
    });
  }
}