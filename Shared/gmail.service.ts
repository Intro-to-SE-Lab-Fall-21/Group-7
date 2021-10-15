import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { interval } from 'rxjs';
import { Gmail } from './gmail.model';
import { HttpClient, HttpParams } from "@angular/common/http";
import { HttpHeaders } from '@angular/common/http';

class Thread_Email{
  From: string;
  Subject: string;
  Body: string;
  getJson() {
    return JSON.stringify(this);
  }
}

@Injectable({
  providedIn: 'root'
})
export class GmailService {

  subject = '';
  from = '';
  body = '';
  snippet = '';
  sub: any;
  //Comment this out
  list3 = [];
  obj3 = [];
  downloads_url: string;
  thread_body: string;
  thread_subject: string;
  thread_from: string;
  thread_ID: string;
  file_name: string;
  type_name: string;
  attachment_id: string;
  message_id: string;

  current_message_ID: string;
  current_Reference_ID: string;
  reply_thread_ID: string;

  dowload_attachment = false;


  id_string: string;

  formData : Gmail;

  readonly rootURLp = 'https://jwo9zx9c16.execute-api.us-east-2.amazonaws.com/upload';
  //readonly rootURLp = "https://qbe7mtvfjl.execute-api.us-east-2.amazonaws.com/upload_files"
  readonly rootURLd = 'https://jwo9zx9c16.execute-api.us-east-2.amazonaws.com/download';

  constructor(private http : HttpClient) { 
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
          maxResults: 30,
          labelIds: "INBOX"
        }).then( response => {
          resolve(response.result)
          console.log("IG: ", response.result.messages)
          
          //COMMENT THIS OUT
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

  public replyEmail(user: gapi.auth2.GoogleUser, formData: Gmail, current_message_ID: string, current_Reference_ID: string, reply_thread_ID: string){
    const auth2 = gapi.auth2.getAuthInstance(); 
    console.log("FormData: To", this.formData.To)

    const option = new gapi.auth2.SigninOptionsBuilder();
    option.setScope('email https://www.googleapis.com/auth/gmail.send');
  
    const googleUser = auth2.currentUser.get();
    googleUser.grant(option).then(
    function(success){
      console.log(JSON.stringify({message: "success", value: success}));
      
      const name = user.getBasicProfile().getName();
      const email = user.getBasicProfile().getEmail();
      const To = formData.To
      const Subject = formData.Subject
      const Body = formData.Body
      const message_id = current_message_ID
      const reference = current_Reference_ID
      const reply_thread_id = reply_thread_ID
      
      
      console.log("NAMWE: ", name)
      
      const message =
      "Content-Type: multipart/alternative; boundary='000000000000f4f9ca05ce134a96'\n" +
      "MIME-Version: 1.0\n" +
      "Content-Transfer-Encoding: 7bit\n" +
      "References: " + reference + "\n" +
      "In-Reply-To: " + message_id + "\n" +
      "From: " + name +  "<" + email + ">\r\n" +
      "To: " + To + "\r\n" +
      "Subject: " + Subject + "\r\n\r\n" +
      Body;

      //const encodedMessage = btoa(message)
      const encodedMessage = btoa(unescape(encodeURIComponent(message)))

      //var str = "äöüÄÖÜçéèñ";
      //var b64 = window.btoa(unescape(encodeURIComponent(str)))
      //console.log(b64);

      const reallyEncodedMessage = encodedMessage.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

      gapi.load('client:auth2', () => {
        gapi.client.load('gmail', 'v1', () => {
          console.log('Loaded Gmail');
            console.log('pop')
            gapi.client.gmail.users.messages.send({
              userId: 'me',
              resource: {
                raw: reallyEncodedMessage,
                threadId: reply_thread_id
              }
            }).then(res => {
              console.log("done!", res)
            });
          })
      });
    },
    function(fail){
      alert(JSON.stringify({message: "fail", value: fail}));
    });
  }

  public sendEmail(user: gapi.auth2.GoogleUser, formData: Gmail){
    const auth2 = gapi.auth2.getAuthInstance(); 
    console.log("FormData: To", this.formData.To)

    const option = new gapi.auth2.SigninOptionsBuilder();
    option.setScope('email https://www.googleapis.com/auth/gmail.send');
  
    const googleUser = auth2.currentUser.get();
    googleUser.grant(option).then(
    function(success){
      console.log(JSON.stringify({message: "success", value: success}));
      
      const name = user.getBasicProfile().getName();
      const email = user.getBasicProfile().getEmail();
      const To = formData.To
      const Subject = formData.Subject
      const Body = formData.Body
      
      
      console.log("NAMWE: ", name)
      
      const message =
      "From: " + name +  "<" + email + ">\r\n" +
      "To: " + To + "\r\n" +
      "Subject: " + Subject + "\r\n\r\n" +
      Body;

      const encodedMessage = btoa(unescape(encodeURIComponent(message)))

      const reallyEncodedMessage = encodedMessage.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

      gapi.load('client:auth2', () => {
        gapi.client.load('gmail', 'v1', () => {
          console.log('Loaded Gmail');
            console.log('pop')
            gapi.client.gmail.users.messages.send({
              userId: 'me',
              resource: {
                raw: reallyEncodedMessage
              }
            }).then(res => {
              console.log("done!", res)
            });
          })
      });
    },
    function(fail){
      alert(JSON.stringify({message: "fail", value: fail}));
    });
  }
  
  public createDraft(user: gapi.auth2.GoogleUser, formData: Gmail){
    console.log(formData)
    const auth2 = gapi.auth2.getAuthInstance(); 
    console.log("FormData: To", this.formData.To)

    const option = new gapi.auth2.SigninOptionsBuilder();
    option.setScope('email https://www.googleapis.com/auth/gmail.compose');
  
    const googleUser = auth2.currentUser.get();
    googleUser.grant(option).then(
    function(success){
      console.log(JSON.stringify({message: "success", value: success}));
      
      const name = user.getBasicProfile().getName();
      const email = user.getBasicProfile().getEmail();
      const To = formData.To
      const Subject = formData.Subject
      const Body = formData.Body
      
      
      console.log("NAMWE: ", name)
      
      const message =
      "From: " + name +  "<" + email + ">\r\n" +
      "To: " + To + "\r\n" +
      "Subject: " + Subject + "\r\n\r\n" +
      Body;

      console.log(message)

      const encodedMessage = btoa(unescape(encodeURIComponent(message)))

      const reallyEncodedMessage = encodedMessage.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

      gapi.load('client:auth2', () => {
        gapi.client.load('gmail', 'v1', () => {
          console.log('Loaded Gmail');
            console.log('pop')
            gapi.client.gmail.users.drafts.create({
              'userId': 'me',
              'resource': {
                'id': '',
                'message': {
                  'raw': reallyEncodedMessage
                }
              }
            }).then(res => {
              console.log("done!", res)
            });
          })
      });
    },
    function(fail){
      alert(JSON.stringify({message: "fail", value: fail}));
    });
  }
  

  public getThread(user: gapi.auth2.GoogleUser, thread_id: string) : Promise<string>{
    //console.log(user.getAuthResponse().expires_at)
    console.log(thread_id)
    return new Promise(resolve => {
      user.reloadAuthResponse().then(refreshed => {
        gapi.client.gmail.users.threads.get({
          userId: user.getId(),
          access_token: user.getAuthResponse().access_token,
          id: thread_id
        }).then( response => {
          resolve(response.result.snippet)
          //console.log(response.result.payload.parts)
          console.log("THREAD: ", response.result)

          console.log("Reply Message-ID", response.result.messages)
          //this.message_ID = response.result.messages[4].threadId

          this.obj3.pop()
          console.log("POP OBJ3: ", this.obj3)

          this.reply_thread_ID = ''
          this.current_Reference_ID = ''
          this.current_message_ID = ''
          

          for(let i = response.result.messages.length - 1; i >= 0; i--){
            console.log("LENGTH: ", response.result.messages[i])

            if(response.result.messages[i].labelIds.includes('SENT')){
              console.log("THIS LIST INLUCDES A SENT")
            }

            if(response.result.messages.length > 1 && response.result.messages[i].labelIds.includes('INBOX')){
              console.log("INBOX IN LIST")
              this.current_message_ID = response.result.messages[i].payload.headers.find(e => e.name === 'Message-ID' || e.name === 'Message-Id').value
              if(response.result.messages[i].payload.headers.find(e => e.name === 'References') != null){
                this.current_Reference_ID = response.result.messages[i].payload.headers.find(e => e.name === 'References').value
              }
              else{
                this.current_message_ID = response.result.messages[i].payload.headers.find(e => e.name === 'Message-ID' || e.name === 'Message-Id').value
              }
              this.reply_thread_ID = response.result.messages[i].threadId
              break
            }
            else if(response.result.messages.length <= 1 && response.result.messages[i].labelIds.includes('INBOX')){
              this.current_message_ID = response.result.messages[i].payload.headers.find(e => e.name === 'Message-ID' || e.name === 'Message-Id').value
              this.current_Reference_ID = response.result.messages[i].payload.headers.find(e => e.name === 'Message-ID' || e.name === 'Message-Id').value
              this.reply_thread_ID = response.result.messages[i].threadId
              break
            }
            else{
              console.log("INBOX NOT IN LIST")
            }
          }

          console.log("MESSAGE -ID: ", this.current_message_ID)
          console.log("REFERENCE ID: ", this.current_Reference_ID)
          console.log("THREAD ID: ", this.reply_thread_ID)
          

          console.log("thread_message: ", response.result.messages.length)
          for(let i = 0; i < response.result.messages.length; i++){
            console.log("ADDING THREAD")

            if(response.result.messages[i].payload.parts == null){
              console.log("NO PARTS")
              console.log("ThREAD BODY WITHOUT PARTS: ", response.result.messages[i].payload.body.data)
              this.thread_body = response.result.messages[i].payload.body.data
              this.thread_body = this.thread_body.replace(/-/g, '/')
              this.thread_body = atob(this.thread_body).replace(/\n/g, "<br>")
              //console.log("THREAD BODIES With Parts: ", response.result.messages[i].payload.parts[0].body)
            }
            else if(response.result.messages[i].payload.body){
              console.log("ThREAD BODY PARTS: ", response.result.messages[i].payload.body)
              //this.thread_body = response.result.messages[i].payload.parts[0].body.data
              if(response.result.messages[i].payload.parts[0].body.size == 0){
                console.log("NULL BODY")

                this.thread_body = response.result.messages[i].payload.parts[0].parts[0].body.data

                if(response.result.messages[i].payload.parts.length >= 2){
                  console.log("RECOGNIZE FILE")
                  this.attachment_id = response.result.messages[i].payload.parts[1].body.attachmentId
                  this.message_id = response.result.id
                  this.file_name = response.result.messages[i].payload.parts[1].filename
                  this.type_name = response.result.messages[i].payload.parts[1].mimeType

                  this.getAttachment(user, this.attachment_id, this.message_id)
                  this.dowload_attachment = true;

                  //this.FileUpload(base64, this.file_name, type)

                }
                else{
                  console.log("NO FILE")
                  this.dowload_attachment = false;
                  this.attachment_id = '';
                  this.message_id = '';
                  this.file_name = '';
                  this.type_name = '';
                }

              }
              else{
                this.thread_body = response.result.messages[i].payload.parts[0].body.data
              }
              this.thread_body = this.thread_body.replace(/-/g, '/')
              //this.thread_body = atob(this.thread_body).replace(/\n/g, "<br />")
              this.thread_body = atob(unescape(encodeURIComponent(this.thread_body))).replace(/\n/g, "<br>")
            }

            
            this.thread_subject = response.result.messages[i].payload.headers.find(e => e.name === 'Subject').value
            this.thread_from = response.result.messages[i].payload.headers.find(e => e.name === 'From').value

            let thread = new Thread_Email()
            thread.From = this.thread_from
            thread.Subject = this.thread_subject
            thread.Body = this.thread_body
            console.log("OBJ THREAD: ", thread)
            this.obj3.push(JSON.parse(JSON.stringify(thread)))
          }
          console.log("OBJ LIST: ", this.obj3)
          //console.log(response.result.payload.parts.find(x => x.partId === '1').body.data)
          //this.body = response.result.payload.parts.find(x => x.partId === '0').body.data
          /*
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
          */

            //this is OK for our example code but should be throttled in production
          //var _downloadUrl = URL.createObjectURL(new Blob(["TExt in here"] , {type:'text/plain'}));
          //console.log(_downloadUrl);

          console.log(this.body)
          //console.log("BODY: ", this.body)
          //console.log(atob('W2ltYWdlOiBHb29nbGVdDQpHNy1FbWFpbCB3YXMgZ3JhbnRlZCBhY2Nlc3MgdG8geW91ciBHb29nbGUgQWNjb3VudA0KDQoNCnN0dmxsY291cnRuZXlAZ21haWwuY29tDQoNCklmIHlvdSBkaWQgbm90IGdyYW50IGFjY2VzcywgeW91IHNob3VsZCBjaGVjayB0aGlzIGFjdGl2aXR5IGFuZCBzZWN1cmUgeW91cg0KYWNjb3VudC4NCkNoZWNrIGFjdGl2aXR5DQo8aHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL0FjY291bnRDaG9vc2VyP0VtYWlsPXN0dmxsY291cnRuZXlAZ21haWwuY29tJmNvbnRpbnVlPWh0dHBzOi8vbXlhY2NvdW50Lmdvb2dsZS5jb20vYWxlcnQvbnQvMTYzMDAzNTQ3NjAwMD9yZm4lM0QxMjclMjZyZm5jJTNEMSUyNmVpZCUzRDMxMzY5NzM4NDQxMzY1NjI3NjklMjZldCUzRDAlMjZhbmV4cCUzRG5yZXQtZmE/DQpZb3UgY2FuIGFsc28gc2VlIHNlY3VyaXR5IGFjdGl2aXR5IGF0DQpodHRwczovL215YWNjb3VudC5nb29nbGUuY29tL25vdGlmaWNhdGlvbnMNCllvdSByZWNlaXZlZCB0aGlzIGVtYWlsIHRvIGxldCB5b3Uga25vdyBhYm91dCBpbXBvcnRhbnQgY2hhbmdlcyB0byB5b3VyDQpHb29nbGUgQWNjb3VudCBhbmQgc2VydmljZXMuDQrCqSAyMDIxIEdvb2dsZSBMTEMsIDE2MDAgQW1waGl0aGVhdHJlIFBhcmt3YXksIE1vdW50YWluIFZpZXcsIENBIDk0MDQzLCBVU0ENCg=='))
          //this.body = this.body.replace(/-/g, '/')
          
          //console.log("LAST: ", this.body.split('/'))
          //console.log(this.body)
          //console.log("BODY: ", atob(this.body))
          //console.log(this.body)
          //this.body = atob(this.body)
          //this.tbody = btoa('<h1>HI</h1>')
          //this.tbody2 = atob(this.tbody)
          //console.log(this.tbody2)
          //console.log("Before ", this.subject, this.from)
          //this.subject = response.result.payload.headers.find(e => e.name === 'Subject').value
          //this.from = response.result.payload.headers.find(e => e.name === 'From').value
          //console.log("After: ", this.subject, this.from)
          console.log("BODY: ", this.body)
          console.log("BODY")

          this.snippet = response.result.snippet

          console.log("FILE NAME: ", this.file_name)

          if(this.dowload_attachment){
            setTimeout( () => {
              this.Filedownload(this.file_name)
              console.log("DOWNLOADER CALLED")
            
            }, 3000 )
          }


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

  FileUpload(base64){

    //this.formData.filename_upload = this.file_to_upload[0]
    console.log("TYPE", this.type_name)
    //console.log("BEFOER: ", btoa(base64))
    //base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    //console.log("BASE REMOVE: ", base64.replace(/-/g, "+").replace(/_/g, '/'))
    base64 = base64.replace(/-/g, "+").replace(/_/g, '/')
    //console.log(atob(base64))
    //let b = atob(base64)
    //console.log(atob(b))
    console.log(base64)

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept':"*/*",
        'Content-Type': this.type_name, 
     })
    };
    
    this.http.post(this.rootURLp, {
      params:{
        filename_upload: base64,
        File_metadata_name: this.file_name,

      },
    }, httpOptions)
    .toPromise()
    .catch(console.log);
  }

  Filedownload(file_name: string){

    
    this.http.get(this.rootURLd, {
      params:{
        Name: file_name,
      },
    })
    .toPromise()
    .then(response => {
      //let url = response[0]
      this.downloads_url = response[0];
      console.log(this.downloads_url)
      
      
    })
    .catch(console.log);
  }

  public getAttachment(user:gapi.auth2.GoogleUser, attachment_id: string, message_id: string) : Promise<string>{
    return new Promise(resolve => {
      user.reloadAuthResponse().then(refreshed => {
        gapi.client.gmail.users.messages.attachments.get({
          userId: "stvllcourtney31@gmail.com",
          id: attachment_id,
          messageId: message_id
        }).then( response => {
          resolve(response.result[0])
          console.log(response.result.data)
          let base64 = ''
          base64 = response.result.data

          this.FileUpload(base64)

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
          console.log("THREAADID: ", response.result.threadId)
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

            //this is OK for our example code but should be throttled in production
          //var _downloadUrl = URL.createObjectURL(new Blob(["TExt in here"] , {type:'text/plain'}));
          //console.log(_downloadUrl);

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
          this.thread_ID = response.result.threadId;
          //console.log("After: ", this.subject, this.from)
          console.log("BODY: ", this.body)
          console.log("BODY")

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


