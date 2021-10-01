import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { interval } from 'rxjs';
import { Gmail } from './gmail.model';

@Injectable({
  providedIn: 'root'
})
export class GmailService {

  subject = '';
  from = '';
  body = '';
  snippet = '';
  sub: any;
  list3 = [];

  id_string: string;

  formData : Gmail

  constructor() { 
    gapi.load('client', () => {
      gapi.client.init({
        apiKey: 'AIzaSyD1tTNrHG5yPvy89nvZYl6xcTte4mvHjw4',
        clientId: '250282669302-oie5sdoflojerg5tq3a2ek34loicot9f.apps.googleusercontent.com',
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
        scope: 'https://www.googleapis.com/auth/gmail.readonly'
      })
    })
  }

  public list(user: gapi.auth2.GoogleUser) : Promise<gapi.client.gmail.ListMessagesResponse> {
    console.log(user.getAuthResponse().expires_at)
    return new Promise( resolve =>{
      user.reloadAuthResponse().then(refreshed => {
        gapi.client.gmail.users.messages.list({
          userId: user.getId(),
          access_token: refreshed.access_token,
          maxResults: 5,
          labelIds: "INBOX"
        }).then( response => {
          resolve(response.result)
          //console.log(response.result.messages)
          for (var product of response.result.messages) {
            this.list3.push(product.id)
            //console.log("P", product.id)
            //this.getMessage(product.id)
          }
          //interval(3000).subscribe(x => console.log("W"))

          /*
          interval(10000).subscribe(x => {
            if(x < this.list3.length){
              console.log(this.list3[x])

              this.id_string = this.list3[x]
              //this.getMessage(user, this.list3[x])
            }
          })

          */
        })
      })
    })
  }

  public getMessage(user: gapi.auth2.GoogleUser, id: string) : Promise<string>{
    //console.log(user.getAuthResponse().expires_at)
    return new Promise(resolve => {
      user.reloadAuthResponse().then(refreshed => {
        gapi.client.gmail.users.messages.get({
          userId: user.getId(),
          access_token: user.getAuthResponse().access_token,
          id: id
        }).then( response => {
          resolve(response.result.snippet)
          console.log(response.result.payload.parts)
          console.log(response.result)
          //console.log(response.result.payload.parts.find(x => x.partId === '1').body.data)
          //this.body = response.result.payload.parts.find(x => x.partId === '0').body.data

          if(response.result.payload.parts == null){
            //console.log("NULL")
            this.body = response.result.payload.body.data
          }
          else if(response.result.payload.parts != null){
            //console.log("NOT NULL")
            if(response.result.payload.parts.find(x => x.partId === '0').body.data == null){
              console.log("yes")
              //this.body = response.result.payload.parts.find(x => x.partId === '0.0').body.data
              this.body = response.result.payload.parts[0].parts.find(x => x.partId === '0.0').body.data
            }
            else{
              this.body = response.result.payload.parts.find(x => x.partId === '0').body.data
            }
          }
          else{
            //console.log("NO")
          }

          console.log(this.body)
          //console.log("BODY: ", this.body)
          //console.log(atob('W2ltYWdlOiBHb29nbGVdDQpHNy1FbWFpbCB3YXMgZ3JhbnRlZCBhY2Nlc3MgdG8geW91ciBHb29nbGUgQWNjb3VudA0KDQoNCnN0dmxsY291cnRuZXlAZ21haWwuY29tDQoNCklmIHlvdSBkaWQgbm90IGdyYW50IGFjY2VzcywgeW91IHNob3VsZCBjaGVjayB0aGlzIGFjdGl2aXR5IGFuZCBzZWN1cmUgeW91cg0KYWNjb3VudC4NCkNoZWNrIGFjdGl2aXR5DQo8aHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL0FjY291bnRDaG9vc2VyP0VtYWlsPXN0dmxsY291cnRuZXlAZ21haWwuY29tJmNvbnRpbnVlPWh0dHBzOi8vbXlhY2NvdW50Lmdvb2dsZS5jb20vYWxlcnQvbnQvMTYzMDAzNTQ3NjAwMD9yZm4lM0QxMjclMjZyZm5jJTNEMSUyNmVpZCUzRDMxMzY5NzM4NDQxMzY1NjI3NjklMjZldCUzRDAlMjZhbmV4cCUzRG5yZXQtZmE/DQpZb3UgY2FuIGFsc28gc2VlIHNlY3VyaXR5IGFjdGl2aXR5IGF0DQpodHRwczovL215YWNjb3VudC5nb29nbGUuY29tL25vdGlmaWNhdGlvbnMNCllvdSByZWNlaXZlZCB0aGlzIGVtYWlsIHRvIGxldCB5b3Uga25vdyBhYm91dCBpbXBvcnRhbnQgY2hhbmdlcyB0byB5b3VyDQpHb29nbGUgQWNjb3VudCBhbmQgc2VydmljZXMuDQrCqSAyMDIxIEdvb2dsZSBMTEMsIDE2MDAgQW1waGl0aGVhdHJlIFBhcmt3YXksIE1vdW50YWluIFZpZXcsIENBIDk0MDQzLCBVU0ENCg=='))
          this.body = this.body.replace(/-/g, '/')
          
          //console.log("LAST: ", this.body.split('/'))
          //console.log(this.body)
          //console.log("BODY: ", atob(this.body))
          //console.log(this.body)
          this.body = atob(this.body)
          //this.tbody = btoa('<h1>HI</h1>')
          //this.tbody2 = atob(this.tbody)
          //console.log(this.tbody2)
          //console.log("Before ", this.subject, this.from)
          this.subject = response.result.payload.headers.find(e => e.name === 'Subject').value
          this.from = response.result.payload.headers.find(e => e.name === 'From').value
          //console.log("After: ", this.subject, this.from)

          this.snippet = response.result.snippet

          //console.log("From: ", this.from)
          //console.log("Subject: ", this.subject)
          //console.log("Snippet: ", this.snippet)
          //console.log("Body: ", this.body)
        })

        //this.sendEmail();

        //this.sendEmail2(user);
        
      })
    })
  }
}
