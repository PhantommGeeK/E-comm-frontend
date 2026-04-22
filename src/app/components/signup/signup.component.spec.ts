import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

import { SignupComponent } from './signup.component';
import { AuthService } from '../../services/auth.service';

describe('SignupComponent validation', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['signup']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    authServiceSpy.signup.and.returnValue(
      of({ token: 'fake-token', username: 'demo', role: 'ROLE_USER' })
    );

    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
      .overrideComponent(SignupComponent, {
        set: { template: '' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should block submit when username is empty', () => {
    component.username = '   ';
    component.password = 'secret123';
    component.confirmPassword = 'secret123';

    component.onSubmit();

    expect(component.errorMessage).toBe('Username and password are required.');
    expect(authServiceSpy.signup).not.toHaveBeenCalled();
  });

  it('should block submit when password is shorter than 6 chars', () => {
    component.username = 'validuser';
    component.password = '12345';
    component.confirmPassword = '12345';

    component.onSubmit();

    expect(component.errorMessage).toBe('Password must be at least 6 characters.');
    expect(authServiceSpy.signup).not.toHaveBeenCalled();
  });

  it('should block submit when password confirmation does not match', () => {
    component.username = 'validuser';
    component.password = 'secret123';
    component.confirmPassword = 'different123';

    component.onSubmit();

    expect(component.errorMessage).toBe('Passwords do not match.');
    expect(authServiceSpy.signup).not.toHaveBeenCalled();
  });

  it('should call signup and navigate when input is valid', () => {
    component.username = 'validuser';
    component.password = 'secret123';
    component.confirmPassword = 'secret123';

    component.onSubmit();

    expect(authServiceSpy.signup).toHaveBeenCalledWith({
      username: 'validuser',
      password: 'secret123'
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.errorMessage).toBeNull();
  });
});
