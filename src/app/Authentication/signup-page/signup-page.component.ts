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

  onSignUp() {
    const isPhoneNumberEmpty = (this.signupObj.phoneNumber == '');
    console.log(isPhoneNumberEmpty);
    const isPasswordValid = (this.signupObj.password == this.signupObj.password_2) && (this.signupObj.password != '') && (this.signupObj.password_2 != '');
    console.log(isPasswordValid);

    if (isPhoneNumberEmpty == false && isPasswordValid == true) {
      this.signupUsers.push(this.signupObj);
      localStorage.setItem('signUpUsers', JSON.stringify(this.signupUsers));
      this.signupObj = {
        phoneNumber: '',
        password: '',
        password_2: ''
      };
      this.toastr.success('Tài khoản của bạn được tạo thành công!', 'Success');
      setTimeout(() => {
        this.router.navigate(['/login']);;
      },
        0);
    }
    else {
      this.toastr.error('Tạo tài khoản thất bại. Xin thử lại.', 'Error');
      return;
    }
  }
}
