import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { interval } from 'rxjs';
import { Gmail } from './gmail.model';
import { HttpClient, HttpParams } from "@angular/common/http";
import { HttpHeaders } from '@angular/common/http';

//Used for creating an object of thread messages
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

  //Used for composing emails
  subject = '';
  from = '';
  body = '';
  snippet = '';
  sub: any;

  //Comment this out
  list3 = [];
  thread_obj = [];
  draft_id = [];
  downloads_url: string;

  //Used to produce the reply thread
  thread_body: string;
  thread_subject: string;
  thread_from: string;
  thread_ID: string;

  //used to get message attachments
  file_name: string;
  type_name: string;
  attachment_id: string;
  message_id: string;

  //Used to reply to emails
  current_message_ID: string;
  current_Reference_ID: string;
  reply_thread_ID: string;

  //used to update and edit drafts
  draft_ID: string;
  draft_message_ID: string;
  draft_message_ThreadID: string;
  draft_Snippet: string;
  draft_From: string;
  draft_To: string;
  draft_Subject: string;
  draft_Body: string;

  //Sending Attachments variables
  attachment_string: string;
  attachment_name: string;
  attachment_type: string;
  attachment_ext: string;

  //Downloading attachments
  dowload_attachment = false;

  id_string: string;

  //User input is stored in this object
  formData : Gmail;

  //Trash
  trash_ID: string;
  trash_ThreadID: string;
  trash_Snippet: string;
  trash_From: string;
  trash_To: string;
  trash_Subject: string;
  trash_Body: string;

  //AWS API Strings
  //Used for downloading attachments
  readonly rootURLp = 'https://jwo9zx9c16.execute-api.us-east-2.amazonaws.com/upload';
  readonly rootURLd = 'https://jwo9zx9c16.execute-api.us-east-2.amazonaws.com/download';

  //User auth login
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

  //List drafts
  public draftList(user: gapi.auth2.GoogleUser) : Promise<gapi.client.gmail.ListDraftsResponse>{
    return new Promise( resolve => {
      user.reloadAuthResponse().then(refreshed => {
        gapi.client.gmail.users.drafts.list({
          userId: user.getId(),
          access_token: refreshed.access_token,
          maxResults: 20,
        }).then( response => {
          resolve(response.result) 
        })
      })
    })
  }

  public trashList(user: gapi.auth2.GoogleUser) : Promise<gapi.client.gmail.ListMessagesResponse>{
    return new Promise( resolve => {
      user.reloadAuthResponse().then(refreshed => {
        gapi.client.gmail.users.messages.list({
          userId: user.getId(),
          access_token: refreshed.access_token,
          maxResults: 10,
          labelIds: "TRASH"
        }).then( response => {
          resolve(response.result)
          //console.log(response.result)
        })
      })
    })
  }

  public move_toTrash(user: gapi.auth2.GoogleUser, move_email_to_trash: string){

    const auth2 = gapi.auth2.getAuthInstance(); 

    const option = new gapi.auth2.SigninOptionsBuilder();
    option.setScope('email https://www.googleapis.com/auth/gmail.modify');
  
    const googleUser = auth2.currentUser.get();
    googleUser.grant(option).then(
      function(success){
        console.log(JSON.stringify({message: "success", value: success}));
  
        gapi.load('client:auth2', () => {
          gapi.client.load('gmail', 'v1', () => {
              gapi.client.gmail.users.messages.trash({
                userId: user.getBasicProfile().getEmail(),
                id: move_email_to_trash,
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

  public deleteEmail(user: gapi.auth2.GoogleUser, remove_email: string){

    const auth2 = gapi.auth2.getAuthInstance(); 

    const option = new gapi.auth2.SigninOptionsBuilder();
    option.setScope('email https://mail.google.com/');
  
    const googleUser = auth2.currentUser.get();
    googleUser.grant(option).then(
      function(success){
        console.log(JSON.stringify({message: "success", value: success}));
  
        gapi.load('client:auth2', () => {
          gapi.client.load('gmail', 'v1', () => {
              gapi.client.gmail.users.messages.delete({
                userId: user.getBasicProfile().getEmail(),
                id: remove_email,
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

  //List the emails in the inbox
  public list(user: gapi.auth2.GoogleUser) : Promise<gapi.client.gmail.ListMessagesResponse> {
    console.log(user.getAuthResponse().expires_at)
    return new Promise( resolve =>{
      user.reloadAuthResponse().then(refreshed => {
        gapi.client.gmail.users.messages.list({
          userId: user.getId(),
          access_token: refreshed.access_token,
          maxResults: 20,
          labelIds: "INBOX"
        }).then( response => {
          resolve(response.result)
          
          //COMMENT THIS OUT
          for (var product of response.result.messages) {
            this.list3.push(product.id);

          }

        })
      })
    })
    
  }

  //Reply to emails
  public replyEmail(user: gapi.auth2.GoogleUser, formData: Gmail, current_message_ID: string, current_Reference_ID: string, reply_thread_ID: string){
    const auth2 = gapi.auth2.getAuthInstance(); 

    const option = new gapi.auth2.SigninOptionsBuilder();
    option.setScope('email https://www.googleapis.com/auth/gmail.send');
  
    const googleUser = auth2.currentUser.get();
    googleUser.grant(option).then(
    function(success){
      console.log(JSON.stringify({message: "success", value: success}));
      
      const name = user.getBasicProfile().getName();
      const email = user.getBasicProfile().getEmail();
      const To = formData.To;
      const Subject = formData.Subject;
      const Body = formData.Body;
      const message_id = current_message_ID;
      const reference = current_Reference_ID;
      const reply_thread_id = reply_thread_ID;
      
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

      const encodedMessage = btoa(unescape(encodeURIComponent(message)));

      const reallyEncodedMessage = encodedMessage.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      gapi.load('client:auth2', () => {
        gapi.client.load('gmail', 'v1', () => {
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

  //Send Drafts
  public sendDraft(user: gapi.auth2.GoogleUser, formData: Gmail, draft_id: string){
    const auth2 = gapi.auth2.getAuthInstance(); 

    const option = new gapi.auth2.SigninOptionsBuilder();
    option.setScope('email https://www.googleapis.com/auth/gmail.send');
  
    const googleUser = auth2.currentUser.get();
    googleUser.grant(option).then(
    function(success){
      console.log(JSON.stringify({message: "success", value: success}));
      
      const name = user.getBasicProfile().getName();
      const email = user.getBasicProfile().getEmail();
      const To = formData.To;
      const Subject = formData.Subject;
      const Body = formData.Body;
      
      const message =
      "From: " + name +  "<" + email + ">\r\n" +
      "To: " + To + "\r\n" +
      "Subject: " + Subject + "\r\n\r\n" +
      Body;

      const encodedMessage = btoa(unescape(encodeURIComponent(message)));

      const reallyEncodedMessage = encodedMessage.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      gapi.load('client:auth2', () => {
        gapi.client.load('gmail', 'v1', () => {
            gapi.client.gmail.users.drafts.send({
              userId: 'me',
              resource: {
                id: draft_id,
                message:{
                  raw: reallyEncodedMessage
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
  
  //Send emails from compose component
  public sendEmail(user: gapi.auth2.GoogleUser, formData: Gmail){
    const auth2 = gapi.auth2.getAuthInstance(); 

    const option = new gapi.auth2.SigninOptionsBuilder();
    option.setScope('email https://www.googleapis.com/auth/gmail.send');
  
    const googleUser = auth2.currentUser.get();
    googleUser.grant(option).then(
    function(success){
      console.log(JSON.stringify({message: "success", value: success}));
      
      const name = user.getBasicProfile().getName();
      const email = user.getBasicProfile().getEmail();
      const To = formData.To;
      const Subject = formData.Subject;
      const Body = formData.Body;
      
      const message =
      "From: " + name +  "<" + email + ">\r\n" +
      "To: " + To + "\r\n" +
      "Subject: " + Subject + "\r\n\r\n" +
      Body;

      const encodedMessage = btoa(unescape(encodeURIComponent(message)));

      const reallyEncodedMessage = encodedMessage.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      gapi.load('client:auth2', () => {
        gapi.client.load('gmail', 'v1', () => {
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
  
  //Send emails with attachments
  public sendEmail_w_attachment(user: gapi.auth2.GoogleUser, formData: Gmail, attachment_base64_data: string, attachment_type: string, attachment_name: string){
    const auth2 = gapi.auth2.getAuthInstance(); 

    const option = new gapi.auth2.SigninOptionsBuilder();
    option.setScope('email https://www.googleapis.com/auth/gmail.send');
  
    const googleUser = auth2.currentUser.get();
    googleUser.grant(option).then(
    function(success){
      console.log(JSON.stringify({message: "success", value: success}));
      
      const name = user.getBasicProfile().getName();
      const email = user.getBasicProfile().getEmail();
      const To = formData.To;
      const Subject = formData.Subject;
      const Body = formData.Body;

      var attach = attachment_base64_data;
      
      const message =
        [
          "MIME-Version: 1.0",
          "From: " + name +  "<" + email + ">",
          "To: " + To,
          `Subject: ` + Subject,
          "Content-Type: multipart/mixed; boundary=012boundary01",
          '',
          "--012boundary01",
          "Content-Type: multipart/alternative; boundary=012boundary02",
          '',
          "--012boundary02",
          "Content-type: text/plain; charset=UTF-8", 
          "Content-Transfer-Encoding: quoted-printable",
          '',
          Body,
          '',
          "--012boundary02--",
          "--012boundary01",
          "Content-Type: " + attachment_type + "; " + "name=" + attachment_name,
          'Content-Disposition: attachment; filename=' + attachment_name,
          "Content-Transfer-Encoding: base64",
          '',
          attach,
          "--012boundary01--",
        ]


      const encodedMessage = btoa(unescape(encodeURIComponent(message.join("\n"))));

      const reallyEncodedMessage = encodedMessage.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      gapi.load('client:auth2', () => {
        gapi.client.load('gmail', 'v1', () => {
            gapi.client.gmail.users.messages.send({
              userId: 'me',
              resource: {
                raw: reallyEncodedMessage, 
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
  
  //Create drafts useing the compose component
  public createDraft(user: gapi.auth2.GoogleUser, formData: Gmail){
    const auth2 = gapi.auth2.getAuthInstance(); 

    const option = new gapi.auth2.SigninOptionsBuilder();
    option.setScope('email https://www.googleapis.com/auth/gmail.compose');
  
    const googleUser = auth2.currentUser.get();
    googleUser.grant(option).then(
    function(success){
      console.log(JSON.stringify({message: "success", value: success}));
      
      const name = user.getBasicProfile().getName();
      const email = user.getBasicProfile().getEmail();
      const To = formData.To;
      const Subject = formData.Subject;
      const Body = formData.Body;
      
      const message =
      "From: " + name +  "<" + email + ">\r\n" +
      "To: " + To + "\r\n" +
      "Subject: " + Subject + "\r\n\r\n" +
      Body;

      const encodedMessage = btoa(unescape(encodeURIComponent(message)));

      const reallyEncodedMessage = encodedMessage.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      gapi.load('client:auth2', () => {
        gapi.client.load('gmail', 'v1', () => {
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
  
  //Update Drafts using the compose component
  public updateDraft(user: gapi.auth2.GoogleUser, formData: Gmail, draft_id: string){
    const auth2 = gapi.auth2.getAuthInstance(); 

    const option = new gapi.auth2.SigninOptionsBuilder();
    option.setScope('email https://www.googleapis.com/auth/gmail.compose');
  
    const googleUser = auth2.currentUser.get();
    googleUser.grant(option).then(
    function(success){
      
      const name = user.getBasicProfile().getName();
      const email = user.getBasicProfile().getEmail();
      const To = formData.To;
      const Subject = formData.Subject;
      const Body = formData.Body;
      
      const message =
      "From: " + name +  "<" + email + ">\r\n" +
      "To: " + To + "\r\n" +
      "Subject: " + Subject + "\r\n\r\n" +
      Body;

      const encodedMessage = btoa(unescape(encodeURIComponent(message)));

      const reallyEncodedMessage = encodedMessage.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      gapi.load('client:auth2', () => {
        gapi.client.load('gmail', 'v1', () => {
          console.log('Loaded Gmail');
            console.log('pop')
            gapi.client.gmail.users.drafts.update({
              'userId': 'me',
              'id': draft_id,
              'resource': {
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
  
//Get thread of a user conversation
  public getThread(user: gapi.auth2.GoogleUser, thread_id: string) : Promise<string>{
    return new Promise(resolve => {
      user.reloadAuthResponse().then(refreshed => {
        gapi.client.gmail.users.threads.get({
          userId: user.getId(),
          access_token: user.getAuthResponse().access_token,
          id: thread_id
        }).then( response => {
          resolve(response.result.snippet)

          this.thread_obj.pop();

          this.reply_thread_ID = '';
          this.current_Reference_ID = '';
          this.current_message_ID = '';
          

          for(let i = response.result.messages.length - 1; i >= 0; i--){

            if(response.result.messages[i].labelIds.includes('SENT')){
              //PASS
            }

            if(response.result.messages.length > 1 && response.result.messages[i].labelIds.includes('INBOX')){
              this.current_message_ID = response.result.messages[i].payload.headers.find(e => e.name === 'Message-ID' || e.name === 'Message-Id').value;
              if(response.result.messages[i].payload.headers.find(e => e.name === 'References') != null){
                this.current_Reference_ID = response.result.messages[i].payload.headers.find(e => e.name === 'References').value;
              }
              else{
                this.current_message_ID = response.result.messages[i].payload.headers.find(e => e.name === 'Message-ID' || e.name === 'Message-Id').value;
              }
              this.reply_thread_ID = response.result.messages[i].threadId;
              break
            }
            else if(response.result.messages.length <= 1 && response.result.messages[i].labelIds.includes('INBOX')){
              this.current_message_ID = response.result.messages[i].payload.headers.find(e => e.name === 'Message-ID' || e.name === 'Message-Id').value;
              this.current_Reference_ID = response.result.messages[i].payload.headers.find(e => e.name === 'Message-ID' || e.name === 'Message-Id').value;
              this.reply_thread_ID = response.result.messages[i].threadId;
              break
            }
            else{
              //PASS
            }
          }
          
          for(let i = 0; i < response.result.messages.length; i++){

            if(response.result.messages[i].payload.parts == null){
              
              this.thread_body = response.result.messages[i].payload.body.data;
              this.thread_body = this.thread_body.replace(/-/g, '/');
              this.thread_body = atob(this.thread_body).replace(/\n/g, "<br>");
            }
            else if(response.result.messages[i].payload.body){
              if(response.result.messages[i].payload.parts[0].body.size == 0){

                this.thread_body = response.result.messages[i].payload.parts[0].parts[0].body.data;

                if(response.result.messages[i].payload.parts.length >= 2){
                  this.attachment_id = response.result.messages[i].payload.parts[1].body.attachmentId;
                  this.message_id = response.result.id;
                  this.file_name = response.result.messages[i].payload.parts[1].filename;
                  this.type_name = response.result.messages[i].payload.parts[1].mimeType;

                  this.getAttachment(user, this.attachment_id, this.message_id);
                  this.dowload_attachment = true;

                }
                else{
                  this.dowload_attachment = false;
                  this.attachment_id = '';
                  this.message_id = '';
                  this.file_name = '';
                  this.type_name = '';
                }

              }
              else{
                this.thread_body = response.result.messages[i].payload.parts[0].body.data;
              }
              this.thread_body = this.thread_body.replace(/-/g, '/');
              this.thread_body = atob(unescape(encodeURIComponent(this.thread_body))).replace(/\n/g, "<br>");
            }

            
            this.thread_subject = response.result.messages[i].payload.headers.find(e => e.name === 'Subject').value;
            this.thread_from = response.result.messages[i].payload.headers.find(e => e.name === 'From').value;

            let thread = new Thread_Email();
            thread.From = this.thread_from;
            thread.Subject = this.thread_subject;
            thread.Body = this.thread_body;
            this.thread_obj.push(JSON.parse(JSON.stringify(thread)));
          }

          this.snippet = response.result.snippet;

          if(this.dowload_attachment){
            setTimeout( () => {
              this.Filedownload(this.file_name)
            
            }, 1000 )
          }

        })
        
      })
    })
    
  }

  //Upload load and store files in AWS
  FileUpload(base64){

    base64 = base64.replace(/-/g, "+").replace(/_/g, '/');

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

  //Download files
  Filedownload(file_name: string){
    
    this.http.get(this.rootURLd, {
      params:{
        Name: file_name,
      },
    })
    .toPromise()
    .then(response => {
      this.downloads_url = response[0];
      
    })
    .catch(console.log);
  }

  //Get attachment ID
  public getAttachment(user:gapi.auth2.GoogleUser, attachment_id: string, message_id: string) : Promise<string>{
    return new Promise(resolve => {
      user.reloadAuthResponse().then(refreshed => {
        gapi.client.gmail.users.messages.attachments.get({
          userId: "stvllcourtney31@gmail.com",
          id: attachment_id,
          messageId: message_id
        }).then( response => {
          resolve(response.result[0])
          let base64 = ''
          base64 = response.result.data

          this.FileUpload(base64)

        })
      })
    })
  }

  public getTrashMessage(user: gapi.auth2.GoogleUser, trash_id: string) : Promise<string>{
    return new Promise(resolve => {
      user.reloadAuthResponse().then(refreshed => {
        gapi.client.gmail.users.messages.get({
          userId: user.getId(),
          access_token: user.getAuthResponse().access_token,
          id: trash_id
        }).then ( response => {
          resolve(response.result.id)
          console.log(response.result)

          this.trash_ID = response.result.id;
          this.trash_ThreadID = response.result.threadId;
          this.trash_Snippet = response.result.snippet;
          this.trash_From = response.result.payload.headers.find(x => x.name === 'From').value;
          this.trash_To = response.result.payload.headers.find(x => x.name === 'To').value;
          this.trash_Subject = response.result.payload.headers.find(x => x.name === 'Subject').value;
          this.trash_Body = response.result.payload.parts[0].body.data;

          this.trash_Body =  this.trash_Body.replace(/-/g, '/');
          this.trash_Body = atob(this.trash_Body)
          
        })
      })
    })
  }

  //Get draft messages that already exist
  public getDraftMessage(user: gapi.auth2.GoogleUser, draft_id: string) : Promise<string>{
    return new Promise(resolve => {
      user.reloadAuthResponse().then(refreshed => {
        gapi.client.gmail.users.drafts.get({
          userId: user.getId(),
          access_token: user.getAuthResponse().access_token,
          id: draft_id
        }).then ( response => {
          resolve(response.result.message.id)

          this.draft_ID = response.result.id;
          this.draft_message_ID = response.result.message.id;
          this.draft_message_ThreadID = response.result.message.threadId;
          this.draft_Snippet = response.result.message.snippet;
          this.draft_From = response.result.message.payload.headers.find(x => x.name === 'From').value;
          this.draft_To = response.result.message.payload.headers.find(x => x.name === 'To').value;
          this.draft_Subject = response.result.message.payload.headers.find(x => x.name === 'Subject').value;
          this.draft_Body = response.result.message.payload.body.data;

          this.draft_Body = this.draft_Body.replace(/-/g, '/');
          this.draft_Body = atob(this.draft_Body);
          
        })
      })
    })
  }

  //Get message in the user inbox
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

          if(response.result.payload.parts == null){
            this.body = response.result.payload.body.data;
          }
          else if(response.result.payload.parts != null){
            if(response.result.payload.parts.find(x => x.partId === '0').body.data == null){

              this.body = response.result.payload.parts[0].parts.find(x => x.partId === '0.0').body.data;
            }
            else{
              this.body = response.result.payload.parts.find(x => x.partId === '0').body.data;
            }
          }
          else{
            //Pass
          }

          this.body = this.body.replace(/-/g, '/');
          
          this.body = atob(this.body);

          this.subject = response.result.payload.headers.find(e => e.name === 'Subject').value;
          this.from = response.result.payload.headers.find(e => e.name === 'From').value;
          this.thread_ID = response.result.threadId;

          this.snippet = response.result.snippet;

        })
        
      })
    })
    
  }

}