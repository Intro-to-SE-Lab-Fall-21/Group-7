import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BaseTypeComponent } from './base-type/base-type.component';
import { SignInComponent } from './base-type/sign-in/sign-in.component';
import { EmailListComponent } from './base-type/email-list/email-list.component';
import { GmailService } from './shared/gmail.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    BaseTypeComponent,
    SignInComponent,
    EmailListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [GmailService, FormsModule, BaseTypeComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
