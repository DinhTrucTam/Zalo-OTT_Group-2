import { Component, OnInit } from '@angular/core';

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

  currentsignUpUsers: any;
  ngOnInit(): void {
    const localData = localStorage.getItem('signUpUsers');
    console.log(typeof localData);
    console.log(JSON.stringify(localData));
    if (localData != null) {
      this.currentsignUpUsers = JSON.parse(localData);
      console.log(this.currentsignUpUsers);
    }
  }
  onLogin() {
    const isUserExist = this.currentsignUpUsers.find((m: { phoneNumber: any; password: any; password_2: any }) =>
      m.phoneNumber == this.loginObj.phoneNumber
      && m.password == this.loginObj.password
      && m.password_2 == this.loginObj.password);
    if (isUserExist != undefined) {
      alert('User login successfully');
    }
    else {
      alert('Wrong credentials');
    }
  }
}
