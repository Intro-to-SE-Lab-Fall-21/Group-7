import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleSignService {

  private auth2: gapi.auth2.GoogleAuth
  private subject = new ReplaySubject<gapi.auth2.GoogleUser>(1)

  constructor() { 
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id: '250282669302-oie5sdoflojerg5tq3a2ek34loicot9f.apps.googleusercontent.com'
      })
    })
  }

  public signin(){
    //console.log("Hit2")
    this.auth2.signIn({
      //
      scope: 'https://www.googleapis.com/auth/gmail.readonly'
    }).then(user =>{
      //console.log("Hit3")
      this.subject.next(user)
    }).catch( () =>{
      this.subject.next(null)
    })
  }

  public signOut(){
    this.auth2.signOut()
      .then( () => {
        this.subject.next(null)
      })
  }

  public observable() : Observable<gapi.auth2.GoogleUser>{
    return this.subject.asObservable()
  }
}
