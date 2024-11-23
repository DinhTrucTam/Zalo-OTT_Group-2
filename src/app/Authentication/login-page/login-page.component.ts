import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit {

  loginObj: any = {
    phoneNumber: '',
    password: ''
  };

  constructor(private router: Router, private toastr: ToastrService) { }

  currentsignUpUsers: any;
  ngOnInit(): void {
    const localData = localStorage.getItem('signUpUsers');
    if (localData != null) {
      this.currentsignUpUsers = JSON.parse(localData);
    }
  }

  onLogin() {
    const isUserExist = this.currentsignUpUsers.find(
      (m: { phoneNumber: any; password: any }) =>
        m.phoneNumber === this.loginObj.phoneNumber && m.password === this.loginObj.password
    );

    if (isUserExist) {
      this.toastr.success('Chào mừng bạn quay trở lại!', 'Success');
      localStorage.setItem('currentUser', JSON.stringify(isUserExist)); // Save current user data
      setTimeout(() => {
        this.router.navigate(['/main-page']);
      }, 100);
    } else {
      this.toastr.error('Đăng nhập thất bại!', 'Error');
    }
  }

}
