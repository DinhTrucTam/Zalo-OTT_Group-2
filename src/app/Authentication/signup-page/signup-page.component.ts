import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css'
})
export class SignupPageComponent implements OnInit {

  signupUsers: any[] = [];

  signupObj: any = {
    phoneNumber: '',
    password: '',
    password_2: ''
  };

  ngOnInit(): void {

  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  constructor(private router: Router, private toastr: ToastrService) { }

  onSignUp(signupForm: any) {
    if (signupForm.valid === false) {
      console.log("Form is invalid, please check fields.");
      this.toastr.error('Tạo tài khoản thất bại. Số điện thoại không hợp lệ. Xin thử lại.', 'Error');
      return;
    }
    else {
      const isPasswordValid = (this.signupObj.password === this.signupObj.password_2) &&
        (this.signupObj.password !== '') &&
        (this.signupObj.password_2 !== '');

      if (isPasswordValid === false) {
        this.toastr.error('Tạo tài khoản thất bại. Mật khẩu không trùng khớp. Xin thử lại.', 'Error');
        return;
      }
      else {
        // Retrieve existing users from localStorage
        const storedUsers = JSON.parse(localStorage.getItem('signUpUsers') || '[]');

        // Add the new user to the array
        storedUsers.push(this.signupObj);

        // Save the updated array back to localStorage
        localStorage.setItem('signUpUsers', JSON.stringify(storedUsers));

        // Clear the signup object for the form
        this.signupObj = {
          phoneNumber: '',
          password: '',
          password_2: ''
        };

        this.toastr.success('Tài khoản của bạn được tạo thành công!', 'Success');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 100);
      }
    }
  }
}

