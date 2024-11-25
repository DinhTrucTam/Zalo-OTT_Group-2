import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent implements OnInit {
  loginObj: any = {
    phoneNumber: '',
    password: '',
  };

  private loginApiUrl = 'http://128.199.91.226:8082/api/login';

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient
  ) { }

  ngOnInit(): void { }

  onLogin() {
    if (!this.loginObj.phoneNumber || !this.loginObj.password) {
      this.toastr.error('Vui lòng điền đầy đủ thông tin đăng nhập.', 'Error');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Cookie: 'JSESSIONID=A131F42C8102F93E213C7AA016E31DA2',
    });

    const payload = {
      username: this.loginObj.phoneNumber,
      password: this.loginObj.password,
    };

    this.http.post(this.loginApiUrl, payload, { headers }).subscribe(
      (response: any) => {
        console.log('Login successful:', response);
        this.toastr.success('Chào mừng bạn quay trở lại!', 'Success');

        // Save the access token and user details to localStorage
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('userId', response.userId);

        // Navigate to the main page
        setTimeout(() => {
          this.router.navigate(['/main-page']);
        }, 100);
      },
      (error) => {
        console.error('Login failed:', error);
        this.toastr.error('Đăng nhập thất bại. Hãy thử lại.', 'Error');
      }
    );
  }
}
