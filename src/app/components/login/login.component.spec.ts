import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent validation', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    authServiceSpy.login.and.returnValue(
      of({ token: 'fake-token', username: 'demo', role: 'ROLE_USER' })
    );

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
      .overrideComponent(LoginComponent, {
        set: { template: '' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should block submit when username is empty', () => {
    component.username = '   ';
    component.password = 'secret123';

    component.onSubmit();

    expect(component.errorMessage).toBe('Username and password are required.');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should block submit when username is shorter than 3 chars', () => {
    component.username = 'ab';
    component.password = 'secret123';

    component.onSubmit();

    expect(component.errorMessage).toBe('Username must be at least 3 characters.');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should block submit when password is shorter than 6 chars', () => {
    component.username = 'validuser';
    component.password = '12345';

    component.onSubmit();

    expect(component.errorMessage).toBe('Password must be at least 6 characters.');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call login and navigate when input is valid', () => {
    component.username = 'validuser';
    component.password = 'secret123';

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      username: 'validuser',
      password: 'secret123'
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    expect(component.errorMessage).toBeNull();
  });
});
