import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';


import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { StoreModule } from '@ngrx/store';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './Authentication/login-page/login-page.component';
import { SignupPageComponent } from './Authentication/signup-page/signup-page.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { GoogleAuthorizationComponent } from './Authentication/google-authorization/google-authorization.component';
import { MainPageComponent } from './Main page/main-page/main-page.component';
import { SafeHtmlPipe } from './safe-html.pipe';
import { VerificationDialogComponent } from './Authentication/verification-dialog/verification-dialog.component';
import { ContactDialogComponent } from './contact-dialog/contact-dialog.component';
import { RemoveMemberDialogComponent } from './remove-member-dialog/remove-member-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    SignupPageComponent,
    GoogleAuthorizationComponent,
    MainPageComponent,
    SafeHtmlPipe,
    VerificationDialogComponent,
    ContactDialogComponent,
    RemoveMemberDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatSidenavModule,
    MatTabsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatInputModule,
    MatFormFieldModule,
    HttpClientModule,
    MatDialogModule,
    BrowserAnimationsModule, // required animations module
    StoreModule.forRoot({}),
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
