import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './Authentication/login-page/login-page.component';
import { SignupPageComponent } from './Authentication/signup-page/signup-page.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { GoogleAuthorizationComponent } from './Authentication/google-authorization/google-authorization.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    SignupPageComponent,
    GoogleAuthorizationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot({
      timeOut: 3000, // duration for which the toast will be displayed
      positionClass: 'toast-top-right', // position of the toast on the screen
      preventDuplicates: true, // prevent duplicate messages
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
