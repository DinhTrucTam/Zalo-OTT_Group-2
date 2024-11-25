import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { VerificationDialogComponent } from '../verification-dialog/verification-dialog.component';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css'
})
export class SignupPageComponent implements OnInit {
  signupUsers: any[] = [];
  signupObj: any = {
    phoneNumber: '',
    name: '',
    email: '',
    password: '',
    password_2: ''
  };

  // private apiUrl = 'http://128.199.91.226:8082/api/send/mail/verify_code';
  private apiUrl = '/api/send/mail/verify_code';

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void { }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  verifyEmail() {
    if (!this.signupObj.email) {
      alert('Bạn vui lòng nhập email.');
      return;
    }

    const headers = new HttpHeaders({
      Cookie: 'JSESSIONID=A131F42C8102F93E213C7AA016E31DA2'
    });

    const email = encodeURIComponent(this.signupObj.email);
    const url = `${this.apiUrl}?email=${email}`;


    this.http.get(url, { headers }).subscribe(
      (response: any) => {
        console.log('Mã số xác minh đã được gửi đến email của bạn', response);
        alert('Mã số xác minh đã được gửi đến email của bạn!');

        const responseJSON = JSON.stringify(response);

        // Store the verification code in localStorage
        localStorage.setItem('verificationCode', responseJSON);

        // Open the verification dialog
        this.openVerificationDialog();
      },
      (error) => {
        console.error('Gặp lỗi khi gửi mã số xác minh', error);
        alert('Gặp lỗi khi gửi mã số xác minh.');
      }
    );
  }

  openVerificationDialog() {
    const dialogRef = this.dialog.open(VerificationDialogComponent, {
      width: '300px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((inputCode) => {
      // Retrieve the stored verification code
      const storedCodeJSON = localStorage.getItem('verificationCode');
      if (storedCodeJSON) {
        const storedCodeObj = JSON.parse(storedCodeJSON); // Parse the JSON string
        const storedCode = storedCodeObj.code; // Extract the 'code' value

        console.log('Stored Code:', storedCode); // Debugging
        console.log('Input Code:', inputCode); // Debugging

        // Compare input code with stored code
        if (inputCode == storedCode) {
          this.toastr.success('Xác minh thành công!', 'Success');
          this.completeSignup();
        } else {
          this.toastr.error('Xác minh thất bại! ', 'Error');
          window.location.reload(); // Reload the page
        }
      } else {
        this.toastr.error('Xác minh thất bại. Tải lại trang...', 'Error');
        window.location.reload();
      }
    });
  }

  onSignUp(signupForm: any) {
    if (signupForm.valid === false) {
      this.toastr.error(
        'Đăng ký thất bại. Vui lòng kiểm tra lại số điện thoại, email, hoặc tên của bạn.',
        'Error'
      );
      return;
    }

    if (this.signupObj.password !== this.signupObj.password_2) {
      this.toastr.error('Mật khẩu không trùng khớp. Hãy thử lại.', 'Error');
      return;
    }

    this.verifyEmail();
  }

  // Complete the signup process after verification
  completeSignup() {
    const signupPayload = {
      name: this.signupObj.name,
      phone: this.signupObj.phoneNumber,
      password: this.signupObj.password,
      dateOfBrith: '1998-07-07', // Static value for now
      email: this.signupObj.email,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Cookie: 'JSESSIONID=A131F42C8102F93E213C7AA016E31DA2'
    });

    this.http.post('http://128.199.91.226:8082/api/signUp', signupPayload, { headers })
      .subscribe(
        (response: any) => {
          console.log('Đăng ký tài khoản thành công:', response);
          this.toastr.success('Đăng ký tài khoản thành công!', 'Success');

          // Clear form data and navigate to login
          this.signupObj = {
            phoneNumber: '',
            name: '',
            email: '',
            password: '',
            password_2: ''
          };

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 100);
        },
        (error) => {
          console.error('Đăng ký tài khoản thất bại:', error);
          this.toastr.error('Đăng ký tài khoản thất bại. Hãy thử lại.', 'Error');
        }
      );
  }
}