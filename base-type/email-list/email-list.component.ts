import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GmailService } from 'src/app/shared/gmail.service';
import { GoogleSignService } from 'src/app/shared/google-sign.service';
import { interval } from 'rxjs';
import { NgForm } from '@angular/forms';

class Person {
  From: string;
  Subject: string;
  Snippet: string;
  ID: string;
  getJson() {
      return JSON.stringify(this);
  }
}

class Read_Email{
  From: string;
  Subject: string;
  Body: string;
  getJson() {
    return JSON.stringify(this);
}
}

@Component({
  selector: 'app-email-list',
  templateUrl: './email-list.component.html',
  styleUrls: ['./email-list.component.css']
})

export class EmailListComponent implements OnInit {

  user: gapi.auth2.GoogleUser;
  messages: gapi.client.gmail.Message[]
  message: string;
  subject: string;
  from: string;
  snippet: string;
  body: string;
  messageid = ""
  compose_popup = false;
  compose_button_popup = false;

  close_popup = false;

  read_popup = false;

  stop_show = false;

  read_email_from = []
  read_email_subject = []
  read_email_body = []
  read_email_id = []

  request_to_read: string;
  

  list2 = []
  list3 = []

  obj = [];
  obj2 = [];

  key_list = ["from", "subject", "snippet"]
  value_list = []
  separate_from = []

  str: String = "THE <br> MAn"

  //test_dict = {"id": ["1", "2", "3"]}

  //mail_dict: {};

  //test_list = [{"id": "1", "name": "h"}, {"id": "2", "name": "j"}, {"id": "3", "name": "k"}]

  test_list: string[];

  test: boolean = false;
  flag: boolean = false;
  id_string: string = '';

  constructor(private signInService: GoogleSignService, private gmailService: GmailService, private ref : ChangeDetectorRef) { }

  ngOnInit(): void {

    this.resetForm()

    this.signInService.observable().subscribe ( user => {
      this.user = user;
      //this.messages = null;
      //this.message = null;
      this.ref.detectChanges()
      //this.prints();
      //this.list();
    })
  }

  prints(){
    console.log("SHSHSH")
  }
 
  show(){
    
    if(this.user != null && !this.stop_show){
      console.log("yes")
      this.list();
      this.compose_button_popup = true;
      this.stop_show = true;
    }else if(this.stop_show){
      //
    }
    else{
      console.log("Yes")
      alert("Please Sign-In")
    }
    

    this.compose_popup = false;
    this.read_popup = false;
    if(this.obj2 != undefined){
      this.obj2.pop()
      console.log("POP")
    }
    else{
      console.log("no pop")
    }
    //console.log("Called")
    
    /*
    if(!this.test){
      this.test = true; 
      this.list();
    }
    else{
      //console.log("Else")
      
    }
    */
    
    
  }

  readEmail(value: any){
    this.read_popup = true;

    this.request_to_read = value
    console.log("Request: ", this.request_to_read)
    let request_index = this.read_email_id.indexOf(this.request_to_read)

    console.log("Request From: ", this.read_email_from[request_index])

    let open = new Read_Email();
    open.From = this.read_email_from[request_index];
    open.Subject = this.read_email_subject[request_index];
    open.Body = this.read_email_body[request_index]
    console.log("Open", open)
    this.obj2.push(JSON.parse(JSON.stringify(open)))
    
    
  }



  list_button(value: any){
    console.log("HI")
    //this.compose_popup = true;
    console.log(value)
  }

  list(){
    //this.compose_button_popup = true;
    //this.compose_popup = false;
    this.gmailService.list(this.user)
    .then(result => {
      //console.log("List: ", result.messages)
      this.list2 = result.messages
      //console.log("New List: ", this.list2)
      this.messages = result.messages
      this.ref.detectChanges()
    })
    interval(750).subscribe(x => {
      if(x < this.list2.length){
        //console.log(this.list2[x])

        this.id_string = this.list2[x].id
        //console.log("this", this.id_string)
        //this.getMessage(this.id_string)
        this.gmailService.getMessage(this.user, this.id_string)
        .then(result => {
          this.message = result
          //this.subject = this.gmailService.subject

          //console.log("SUBJECT: ", this.subject)

          //this.from = this.gmailService.from

          //this.snippet = this.gmailService.snippet

          if(this.gmailService.subject == '' || this.gmailService.from == '' || this.gmailService.snippet == ''){
            //console.log("NO PUSH")
          }
          else if(this.gmailService.subject && this.gmailService.from && this.gmailService.snippet){

            this.subject = this.gmailService.subject
            this.body = this.gmailService.body.replace(/\n/g, "<br />")

            //console.log("SUBJECT: ", this.subject)
            this.separate_from = this.gmailService.from.split("<")
            console.log(this.separate_from)
  
            this.from = this.separate_from[0]
  
            this.snippet = this.gmailService.snippet

            
            this.value_list = []
            this.value_list.push(this.from)
            this.value_list.push(this.subject)
            this.value_list.push(this.snippet)
            this.value_list.push(this.id_string)
            
            //console.log("AFTER PUSH: ", this.value_list)

            if(this.read_email_id.includes(this.id_string)){
              console.log("yes includes")
            }
            else{
              console.log("Nope it dont")
              this.read_email_id.push(this.id_string)
              this.read_email_from.push(this.from)
              this.read_email_subject.push(this.subject)
              this.read_email_body.push(this.body)
            }
            

            let person = new Person();
            person.From = this.value_list[0];
            person.Subject = this.value_list[1];
            person.Snippet = this.value_list[2];
            person.ID = this.value_list[3];
            console.log("Person: ", person);
            console.log(this.value_list[1])
            //this.obj = JSON.parse(JSON.stringify(person))
            this.obj.push(JSON.parse(JSON.stringify(person)))
            //console.log(this.obj)
            this.value_list = null
            //console.log(this.value_list)

            /*
            
            for(let i = 0; i < this.key_list.length; i++){
              /*
              this.test_list.push({
                value: this.value_list[i]
              });
              */
              /*
              let person = new Person();
              person.firstName = this.value_list[i];
              person.lastName = this.value_list[i+1];
              person.middleName = this.value_list[i+2]
              console.log(person);
              

              //this.test_list.push(stringify(person))
            }

            */

            console.log("IDS: ", this.read_email_id)
            
            
            
            
          }
          else{
            console.log("FATAL ERROR")
          }


          //console.log("Test_LIST: ", this.test_list)
          this.ref.detectChanges()
        })
        
      }
      /*
      else{
        console.log("DONE!!!")
        this.flag = true
      }
      */
    })

  }

  open_compose(){
    console.log("clicked")

    if(this.user != null){
      console.log("yes")
      this.compose_popup = true;
      console.log(this.compose_popup)
    }
    else{
      console.log("Yes")
      alert("Please Sign-In")
    }

  }

  resetForm(form? : NgForm){
    if(form != null)
      form.resetForm()
    this.gmailService.formData = {
      To: '', 
      Subject: '',
      Body: '',
    }
  }

  onSubmit(form : NgForm){
    console.log(form.value)
    //this.service.sendEmail(form.value)
    this.gmailService.sendEmail(this.user, form.value)
    this.resetForm(form)
  }

  /*

  getMessage(id: string){
    console.log(id)
    this.gmailService.getMessage(this.user, id)
    .then(result =>{
      this.message = result
      this.ref.detectChanges()
    })
  }
  */


}
