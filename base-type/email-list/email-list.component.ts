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
  Thread_ID: string;
  getJson() {
      return JSON.stringify(this);
  }
}

class Drafts {
  Draft_ID: string;
  Message_ID: string;
  Message_ThreadID: string;
  Snippet: string;
  From: string;
  To: string;
  Subject: string;
  Body: string;
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
  draft_messages: gapi.client.gmail.Draft[]
  message: string;
  draft_message: string;
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
  stop_show_drafts_inbox = false;

  reply_to_thread = false;
  forward_thread = false;
  search = false;
  open_draft_inbox = false;

  draft_edit = false;

  file_explorer = false;

  read_email_from = []
  read_email_subject = []
  read_email_body = []
  read_email_id = []

  request_to_read: string;

  thread_body: string;
  thread_subject: string;
  thread_ID: string;

  draft_subject: string;
  draft_from: string;
  draft_to: string;
  draft_body: string;
  draft_snippet: string;
  draft_id: string;
  draft_message_id: string;
  draft_message_thread_id: string;

  update_draftID: string;
  send_draftID: string;

  sender_email: string;
  reply_subject: string;
  

  list2 = []
  list3 = []
  draft_id_list = []

  reply_list = []

  obj = [];
  obj2 = [];
  search_obj = [];
  draft_obj = [];

  key_list = ["from", "subject", "snippet"]
  Mime_dict = {"txt": "plain/text", "pdf": "application/pdf", "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "doc": "application/msword", "png": "image/png", "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              "jpeg": "image/jpeg", "jpg": "image/jpeg", "csv": "text/csv", "xls": "application/vnd.ms-excel", "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
  
  value_list = [];
  draft_value_list = [];
  separate_from = []
  separate_draft_from = []

  str: String = "THE <br> MAn"

  draft_list_obj = {}

  test_list: string[];

  test: boolean = false;
  flag: boolean = false;
  id_string: string = '';
  draft_id_string: string = '';

  constructor(private signInService: GoogleSignService, private gmailService: GmailService, private ref : ChangeDetectorRef) { }

  ngOnInit(): void {

    this.resetForm()

    this.signInService.observable().subscribe ( user => {
      this.user = user;
      this.ref.detectChanges()
      console.log("USER is logged in")
      document.getElementById("show_inbox").click();
    })

    
  }
  //Is this being excuted???
  prints(){
    console.log("SHSHSH")
  }
 
  show(){
    
    if(this.user != null && !this.stop_show){
      //console.log("yes")
      this.list();
      this.compose_button_popup = true;
      this.stop_show = true;
    }else if(this.stop_show){
      this.resetForm();
      this.gmailService.dowload_attachment = false;
      this.gmailService.attachment_id = '';
      this.gmailService.message_id = '';
      this.gmailService.file_name = '';
      this.gmailService.type_name = '';
      this.reply_to_thread = false;
      this.forward_thread = false;
      this.open_draft_inbox = false;
      this.draft_edit = false;
    }
    else{
      console.log("Yes")
      alert("Please Sign-In")
    }
    

    this.compose_popup = false;
    this.read_popup = false;
    if(this.gmailService.obj3 != undefined){
      this.obj2.pop()
      //console.log(this.gmailService.obj3.length)
      let empty_obj3 = this.gmailService.obj3.length
      for(let i = 0; i < empty_obj3; i++){
        this.gmailService.obj3.pop()
      }
      //console.log("POP")
    }
    else{
      //console.log("no pop")
    }

    //this.gmailService.getThread(this.user)
    //console.log("Called")
    
  }

  readEmail(value: any){
    this.read_popup = true;

    this.request_to_read = value
    //console.log("Request: ", this.request_to_read)
    let request_index = this.read_email_id.indexOf(this.request_to_read)

    //console.log("Request From: ", this.read_email_from[request_index])

    let open = new Read_Email();
    open.From = this.read_email_from[request_index];
    open.Subject = this.read_email_subject[request_index];
    open.Body = this.read_email_body[request_index]
    //console.log("Open", open)
    this.obj2.push(JSON.parse(JSON.stringify(open)))
    
    
  }

  threadEmail(value: any){
    this.read_popup = true;
    this.compose_popup = false;
    this.resetForm()
    if(this.stop_show){
      this.gmailService.obj3 = []
      this.resetForm();
      this.gmailService.dowload_attachment = false;
      this.gmailService.attachment_id = '';
      this.gmailService.message_id = '';
      this.gmailService.file_name = '';
      this.gmailService.type_name = '';
      this.reply_to_thread = false;
      this.forward_thread = false;
      this.open_draft_inbox = false;
      this.draft_edit = false;
    }
    this.gmailService.getThread(this.user, value)

  }


  //Is this being executed???
  list_button(value: any){
    console.log("HI")
    //this.compose_popup = true;
    console.log(value)
  }

  edit_draft(value: any){
    //console.log(value)
    this.draft_edit = true;
    this.compose_popup = false;

    for(let i = 0; i < this.draft_obj.length; i++){
      if(this.draft_obj[i].Draft_ID == value){
        //console.log("Yes")
        this.gmailService.formData.To = this.draft_obj[i].To;
        this.gmailService.formData.Subject = this.draft_obj[i].Subject;
        this.gmailService.formData.Body = this.draft_obj[i].Body;
        this.update_draftID = this.draft_obj[i].Draft_ID
        this.send_draftID = this.draft_obj[i].Draft_ID
        break
      }
      else{
        //console.log("NOPE")
      }
    }

  }

  draft_close(){
    this.draft_edit = false;
    this.resetForm()
  }

  draftList(){
    //console.log("Draft List called")
    this.open_draft_inbox = true;
    this.read_popup = false;
    if(this.user != null && !this.stop_show_drafts_inbox){
      this.stop_show_drafts_inbox = true;
      this.gmailService.draftList(this.user)
      .then(result => {
        //console.log("List: ", result.drafts)
        this.draft_id_list = result.drafts
        //console.log("New List: ", this.draft_id_list)
        this.draft_messages = result.drafts
        this.ref.detectChanges()
      })
      interval(750).subscribe(x => {
        if(x < this.draft_id_list.length){
          //console.log(this.draft_id_list[x].id)
  
          this.draft_id_string = this.draft_id_list[x].id
          this.gmailService.getDraftMessage(this.user, this.draft_id_string)
          .then(result => {
            this.draft_message = result
  
            if(this.gmailService.draft_Subject == '' || this.gmailService.draft_From == '' || this.gmailService.draft_Snippet == ''){
              //
            }
            else if(this.gmailService.draft_Subject && this.gmailService.draft_From && this.gmailService.draft_Snippet){
              this.draft_subject = this.gmailService.draft_Subject
              this.draft_body = this.gmailService.draft_Body.replace(/\n/g, "<br />")
  
              this.separate_draft_from = this.gmailService.draft_From.split("<")
              //console.log(this.separate_draft_from)
  
              this.draft_from = this.separate_draft_from[0]
              this.draft_to = this.gmailService.draft_To
              this.draft_snippet = this.gmailService.draft_Snippet
              this.draft_id = this.gmailService.draft_ID
              this.draft_message_id = this.gmailService.draft_message_ID
              this.draft_message_thread_id = this.gmailService.draft_message_ThreadID
  
              this.draft_value_list = []
              this.draft_value_list.push(this.draft_id)
              this.draft_value_list.push(this.draft_message_id)
              this.draft_value_list.push(this.draft_message_thread_id)
              this.draft_value_list.push(this.gmailService.draft_Snippet)
              this.draft_value_list.push(this.gmailService.draft_From)
              this.draft_value_list.push(this.gmailService.draft_To)
              this.draft_value_list.push(this.gmailService.draft_Subject)
              this.draft_value_list.push(this.gmailService.draft_Body)
  
              let drafts = new Drafts();
              drafts.Draft_ID = this.draft_value_list[0];
              drafts.Message_ID = this.draft_value_list[1];
              drafts.Message_ThreadID = this.draft_value_list[2];
              drafts.Snippet = this.draft_value_list[3]
              drafts.From = this.draft_value_list[4]
              drafts.To = this.draft_value_list[5]
              drafts.Subject = this.draft_value_list[6]
              drafts.Body = this.draft_value_list[7]
              this.draft_obj.push(JSON.parse(JSON.stringify(drafts)))
  
              this.draft_value_list = null
   
  
            }
            else{
              console.log("FATAL ERROR")
            }
            //this.ref.detectChanges()
          })
        }
  
        //console.log(this.draft_obj)
        
      })
    }
    else if(this.stop_show_drafts_inbox){
      //console.log("STOP")
    }

    else{
      //console.log("CHECK IT")
    }
    
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
            //console.log(this.separate_from)
  
            this.from = this.separate_from[0]
  
            this.snippet = this.gmailService.snippet
            this.thread_ID = this.gmailService.thread_ID

            
            this.value_list = []
            this.value_list.push(this.from)
            this.value_list.push(this.subject)
            this.value_list.push(this.snippet)
            this.value_list.push(this.id_string)
            this.value_list.push(this.thread_ID)
            
            //console.log("AFTER PUSH: ", this.value_list)

            if(this.read_email_id.includes(this.id_string)){
              //console.log("yes includes")
            }
            else{
              //console.log("Nope it dont")
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
            person.Thread_ID = this.value_list[4]
            //console.log("Person: ", person);
            //console.log(this.value_list[1])
            //this.obj = JSON.parse(JSON.stringify(person))
            this.obj.push(JSON.parse(JSON.stringify(person)))
            //console.log(this.obj)
            this.value_list = null
            //console.log(this.value_list)

            //console.log("IDS: ", this.read_email_id)
            
            
          }
          else{
            console.log("FATAL ERROR")
          }


          //console.log("Test_LIST: ", this.test_list)
          this.ref.detectChanges()
        })
        
      }
    })

  }

  open_compose(){
    //console.log("clicked")

    if(this.read_popup){
      this.read_popup = false;
      this.resetForm()
    }

    if(this.user != null){
      this.resetForm()
      //console.log("yes")
      this.compose_popup = true;
      this.draft_edit = false;
      //console.log(this.compose_popup)
    }
    else{
      console.log("Yes")
      alert("Please Sign-In")
    }

  }

  resetForm(form? : NgForm){
    if(form != null)
      form.resetForm()

    if(this.search){
      this.gmailService.formData = {
        To: '', 
        Subject: '',
        Body: '',
        Search: this.gmailService.formData.Search,
      }
    }
    else{
      this.gmailService.formData = {
        To: '', 
        Subject: '',
        Body: '',
        Search: '',
      }

      this.search_obj = []

    }
    
  }

  onSubmit(form : NgForm){
    //console.log(form.value)

    let element = <HTMLInputElement> document.getElementById("check");
    if(element.checked != null && element.checked){
      //console.log("Call Create draft Function")
      this.gmailService.createDraft(this.user, form.value)
      
    }
    else{
      if(this.file_explorer){
        this.gmailService.sendEmail_w_attachment(this.user, form.value, this.gmailService.attachment_string, this.gmailService.attachment_type, this.gmailService.attachment_name)
        this.empty_browse()
      }
      else{
        this.gmailService.sendEmail(this.user, form.value)
      }
      
    }
    this.resetForm(form)
    element.checked = false;
  }

  onUpdate(form4 : NgForm){

    //console.log(form4.value)

    let element = <HTMLInputElement> document.getElementById("check_update");
    if(element.checked != null && element.checked){
      //console.log("Update Draft")
      //console.log(form4.value)
      //console.log("DRAFT ID TO SEND: ", this.update_draftID)
      this.gmailService.updateDraft(this.user, form4.value, this.update_draftID)
      
    }
    else{
      //console.log("SEND DRAFT")
      this.gmailService.sendDraft(this.user, form4.value, this.send_draftID)
    }
    this.resetForm()
    element.checked = false;

  }

  send_close(){
    this.resetForm()
    this.compose_popup = false;
  }

  empty_browse(){
    this.gmailService.attachment_name = '';
    this.file_explorer = false;
  }

  text(){

    if((<HTMLInputElement>document.getElementById("Search")).value && (<HTMLInputElement>document.getElementById("Search")).value.length > 2){
      this.search = true;
    }
    else{
      this.search = false;
    }

    if((<HTMLInputElement>document.getElementById("Search")).value.length >= 3 && this.search_obj.length == 0){
      var predictive_word = (<HTMLInputElement>document.getElementById("Search")).value

      let search_param = '';
      this.search_obj = [];
      search_param = this.gmailService.formData.Search

      for(let i = 0; i < this.obj.length; i++){
        if(this.obj[i].From.includes(search_param)){
          //console.log(this.obj[i])
          this.search_obj.push(this.obj[i])
        }
      }
    }
    else if((<HTMLInputElement>document.getElementById("Search")).value.length == 0){
      this.resetForm()
      this.search = false;
      this.search_obj = [];
    }
  }

  onReply(form2 : NgForm){
    //console.log(form2.value)
    this.gmailService.replyEmail(this.user, form2.value, this.gmailService.current_message_ID, this.gmailService.current_Reference_ID, this.gmailService.reply_thread_ID)
    this.reply_to_thread = false
    this.resetForm()
    
    setTimeout( () => {
      let empty_obj3 = this.gmailService.obj3.length
      for(let i = 0; i < empty_obj3; i++){
        this.gmailService.obj3.pop()
        //console.log("OBSERVE onreply: ", this.gmailService.obj3)

      }
      this.threadEmail(this.gmailService.reply_thread_ID)
    }, 7000 )
    
  }

  reply_close(){
    this.reply_to_thread = false
    this.forward_thread = false
    this.resetForm()

  }

  reply(){
    //log("REPLY")
    //console.log(this.gmailService.obj3)

    if(this.forward_thread){
      this.forward_thread = false;
      this.resetForm()
    }

    for(let i = 0; i < this.gmailService.obj3.length; i++){

      let email_reply: string = this.gmailService.obj3[i].From
      let subject_reply: string = this.gmailService.obj3[i].Subject
      //console.log("SUBJECT THREADA REPLY", subject_reply)

      this.reply_subject = subject_reply;

      let email_length = email_reply.split(" ")
      let index_length = email_length.length
      //console.log(index_length)
      //console.log("EMAIL HER: ", email_length)
      //console.log("GMAIL ACCOUNT: ", this.user.getBasicProfile().getEmail())
      if(email_length[index_length - 1] != "<" + this.user.getBasicProfile().getEmail() + ">"){
        this.reply_to_thread = true
        
        //console.log(email_length[index_length - 1])
        let reply_to_sender: string = email_length[index_length - 1].replace("<", "")
        reply_to_sender = reply_to_sender.replace(">", "")
        //console.log(reply_to_sender)
        this.sender_email = reply_to_sender
        break
        
      }
      //console.log("PASSS")

    }

    //console.log("STOPED")
    this.gmailService.formData.To = this.sender_email
    this.gmailService.formData.Subject = this.reply_subject
    
  }

  onForward(form3 : NgForm){
    //console.log("FORAWRD REAPONSE: ", form3.value)
    this.gmailService.sendEmail(this.user, form3.value)
    this.resetForm()
    this.reply_to_thread = false
    this.forward_thread = false

  }

  //Detect that a user select a file from File Explorer
  onNativeInputFileSelect(event: any) {
    //console.log(event.target.value)
    //console.log(event.target.value.split("\\"))
    this.gmailService.attachment_name = event.target.value.split("\\")[2]
    this.gmailService.attachment_ext = this.gmailService.attachment_name.split(".")[1]
    //console.log(this.gmailService.attachment_name)

    this.gmailService.attachment_type = this.Mime_dict[this.gmailService.attachment_ext]
    this.file_explorer = true

    if (event.target.value) {
      const file: File = event.target.files[0];
      
      this.changeFile(file).then(
        (base64: any): any => {
          var s = String(base64).split(",")
          //console.log(s[1])
          this.gmailService.attachment_string = s[1]
          //console.log(btoa(s[1]))
 
        }
      );
    }
  }

  //Convert File Selected to Base64
  changeFile(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  forward(){
    //console.log("Forward")
    if(this.reply_to_thread){
      this.reply_to_thread = false;
      this.resetForm();
    }
    this.forward_thread = true;
    //console.log(this.gmailService.obj3)

    let forward_subject = "FWD: " + this.gmailService.obj3[0].Subject
    //console.log(forward_subject)

    let compose_forward_body = '';

    for(let i = 0; i < this.gmailService.obj3.length; i++){
      compose_forward_body += this.gmailService.obj3[i].From + "\n" + this.gmailService.obj3[i].Subject + "\n" + this.gmailService.obj3[i].Body.replace(/<br>/g, '\n') + "\n\n"

    }

    //console.log(compose_forward_body)

    this.gmailService.formData.Subject = forward_subject;
    this.gmailService.formData.Body = compose_forward_body;

  }

}
