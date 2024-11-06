import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginPageComponent } from './Authentication/login-page/login-page.component';
import { SignupPageComponent } from './Authentication/signup-page/signup-page.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirect to login as default
  { path: 'login', component: LoginPageComponent },
  { path: 'sign-up', component: SignupPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
