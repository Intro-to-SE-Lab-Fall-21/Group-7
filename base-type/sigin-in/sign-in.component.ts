import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GoogleSignService } from 'src/app/shared/google-sign.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
}) 
export class SignInComponent implements OnInit {

  user: gapi.auth2.GoogleUser;
  popup = false;

  constructor(private signInService: GoogleSignService, private ref : ChangeDetectorRef) { }

  ngOnInit(): void {

    this.signInService.observable().subscribe ( user => {
      this.user = user;
      //this.messages = null;
      //this.message = null;
      this.ref.detectChanges()
    })
  }

  signIn(){
    this.signInService.signin()
    
  }

  signOut(){
    this.signInService.signOut()
  }

  open_compose(){
    this.popup = true
  }

}
