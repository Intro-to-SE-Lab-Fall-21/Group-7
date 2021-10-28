import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GmailService } from 'src/app/shared/gmail.service';
import { GoogleSignService } from 'src/app/shared/google-sign.service';
import { interval } from 'rxjs';
import { NgForm } from '@angular/forms';

//User Email
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

//User drafts
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

//user read emails
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
  
  //User auth token
  user: gapi.auth2.GoogleUser;

  //Used to list email in inbox
  messages: gapi.client.gmail.Message[];
  draft_messages: gapi.client.gmail.Draft[];

  //Compose an email
  message: string;
  draft_message: string;
  subject: string;
  from: string;
  snippet: string;
  body: string;
  messageid = "";
  
  //Boolean statements for close/opening certain components
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

  //used to display thread
  read_email_from = [];
  read_email_subject = [];
  read_email_body = [];
  read_email_id = [];

  request_to_read: string;

  thread_body: string;
  thread_subject: string;
  thread_ID: string;

  //Used to create draft
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
  

  id_list = [];
  list3 = [];
  draft_id_list = [];

  reply_list = [];

  //store an aray of email ids
  list_obj = [];

  //Display the email contents
  read_obj = [];

  search_obj = [];
  draft_obj = [];

  //Dictionary for matching file type with MIME type
  Mime_dict = {"txt": "plain/text", "pdf": "application/pdf", "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "doc": "application/msword", "png": "image/png", "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              "jpeg": "image/jpeg", "jpg": "image/jpeg", "csv": "text/csv", "xls": "application/vnd.ms-excel", "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"};
  
  email_content_list = [];
  draft_value_list = [];
  //Used to split <example@gmail.com> and the nme of the user
  separate_from = [];
  separate_draft_from = [];

  draft_list_obj = {};

  test_list: string[];

  id_string: string = '';
  draft_id_string: string = '';

  constructor(private signInService: GoogleSignService, private gmailService: GmailService, private ref : ChangeDetectorRef) { }
  //Used for logging in
  ngOnInit(): void {

    this.resetForm();

    this.signInService.observable().subscribe ( user => {
      this.user = user;
      this.ref.detectChanges()
      document.getElementById("show_inbox").click();
    })
  }
  //Automatically make an api call to list email in inbox
  show(){
    
    if(this.user != null && !this.stop_show){
      this.list();
      this.compose_button_popup = true;
      this.stop_show = true;
    }
    
    else if(this.stop_show){
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
      alert("Please Sign-In")
    }

    this.compose_popup = false;
    this.read_popup = false;
    if(this.gmailService.thread_obj != undefined){
      this.read_obj.pop();
      let empty_thread_obj = this.gmailService.thread_obj.length;
      for(let i = 0; i < empty_thread_obj; i++){
        this.gmailService.thread_obj.pop();
      }
    }
    else{
      //PASS
    }
  }
  //Read emails
  readEmail(value: any){
    this.read_popup = true;

    this.request_to_read = value;

    let request_index = this.read_email_id.indexOf(this.request_to_read);

    let open = new Read_Email();
    open.From = this.read_email_from[request_index];
    open.Subject = this.read_email_subject[request_index];
    open.Body = this.read_email_body[request_index];
    this.read_obj.push(JSON.parse(JSON.stringify(open)));
    
  }
  //Get thread of emails
  threadEmail(value: any){
    this.read_popup = true;
    this.compose_popup = false;
    this.resetForm();
    if(this.stop_show){
      this.gmailService.thread_obj = [];
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
    this.gmailService.getThread(this.user, value);
  }

  deleteEmail(value: any){
    console.log(value)
    let delete_email = confirm('Are you sure?');
    console.log(delete_email)

    if(delete_email){
      console.log("API CALL")
    }
  }

  //Edit drafts
  edit_draft(value: any){

    this.draft_edit = true;
    this.compose_popup = false;

    for(let i = 0; i < this.draft_obj.length; i++){
      if(this.draft_obj[i].Draft_ID == value){

        this.gmailService.formData.To = this.draft_obj[i].To;
        this.gmailService.formData.Subject = this.draft_obj[i].Subject;
        this.gmailService.formData.Body = this.draft_obj[i].Body;
        this.update_draftID = this.draft_obj[i].Draft_ID;
        this.send_draftID = this.draft_obj[i].Draft_ID;
        break
      }
      else{
        //PASS
      }
    }
  }

  //Clsoe drafts
  draft_close(){
    this.draft_edit = false;
    this.resetForm();
  }

  //List draft in draft inbox
  draftList(){

    this.open_draft_inbox = true;
    this.read_popup = false;
    if(this.user != null && !this.stop_show_drafts_inbox){
      this.stop_show_drafts_inbox = true;
      this.gmailService.draftList(this.user)
      .then(result => {

        this.draft_id_list = result.drafts;

        this.draft_messages = result.drafts;
        this.ref.detectChanges();
      })
      interval(750).subscribe(x => {
        if(x < this.draft_id_list.length){
  
          this.draft_id_string = this.draft_id_list[x].id;
          this.gmailService.getDraftMessage(this.user, this.draft_id_string)
          .then(result => {
            this.draft_message = result;
  
            if(this.gmailService.draft_Subject == '' || this.gmailService.draft_From == '' || this.gmailService.draft_Snippet == ''){
              //PASS
            }
            else if(this.gmailService.draft_Subject && this.gmailService.draft_From && this.gmailService.draft_Snippet){
              this.draft_subject = this.gmailService.draft_Subject;
              
              //Replace white space with html break
              this.draft_body = this.gmailService.draft_Body.replace(/\n/g, "<br />");
  
              this.separate_draft_from = this.gmailService.draft_From.split("<");
  
              this.draft_from = this.separate_draft_from[0];
              this.draft_to = this.gmailService.draft_To;
              this.draft_snippet = this.gmailService.draft_Snippet;
              this.draft_id = this.gmailService.draft_ID;
              this.draft_message_id = this.gmailService.draft_message_ID;
              this.draft_message_thread_id = this.gmailService.draft_message_ThreadID;
  
              this.draft_value_list = [];
              this.draft_value_list.push(this.draft_id);
              this.draft_value_list.push(this.draft_message_id);
              this.draft_value_list.push(this.draft_message_thread_id);
              this.draft_value_list.push(this.gmailService.draft_Snippet);
              this.draft_value_list.push(this.gmailService.draft_From);
              this.draft_value_list.push(this.gmailService.draft_To);
              this.draft_value_list.push(this.gmailService.draft_Subject);
              this.draft_value_list.push(this.gmailService.draft_Body);
  
              let drafts = new Drafts();
              drafts.Draft_ID = this.draft_value_list[0];
              drafts.Message_ID = this.draft_value_list[1];
              drafts.Message_ThreadID = this.draft_value_list[2];
              drafts.Snippet = this.draft_value_list[3];
              drafts.From = this.draft_value_list[4];
              drafts.To = this.draft_value_list[5];
              drafts.Subject = this.draft_value_list[6];
              drafts.Body = this.draft_value_list[7];
              this.draft_obj.push(JSON.parse(JSON.stringify(drafts)));
  
              this.draft_value_list = null;
  
            }
            else{
              console.log("FATAL ERROR");
            }
          })
        }
        
      })
    }
    else if(this.stop_show_drafts_inbox){
      //pASS
    }

    else{
      //PASS
    }
  }

  //List email in inbox
  list(){
    this.gmailService.list(this.user)
    .then(result => {
      this.id_list = result.messages;

      this.messages = result.messages;
      this.ref.detectChanges();
    })
    interval(750).subscribe(x => {
      if(x < this.id_list.length){

        this.id_string = this.id_list[x].id;

        this.gmailService.getMessage(this.user, this.id_string)
        .then(result => {
          this.message = result;

          if(this.gmailService.subject == '' || this.gmailService.from == '' || this.gmailService.snippet == ''){
            //PASS
          }
          else if(this.gmailService.subject && this.gmailService.from && this.gmailService.snippet){

            this.subject = this.gmailService.subject;
            this.body = this.gmailService.body.replace(/\n/g, "<br />");

            this.separate_from = this.gmailService.from.split("<");
  
            this.from = this.separate_from[0];
  
            this.snippet = this.gmailService.snippet;
            this.thread_ID = this.gmailService.thread_ID;
            
            this.email_content_list = [];
            this.email_content_list.push(this.from);
            this.email_content_list.push(this.subject);
            this.email_content_list.push(this.snippet);
            this.email_content_list.push(this.id_string);
            this.email_content_list.push(this.thread_ID);

            if(this.read_email_id.includes(this.id_string)){

            }
            else{

              this.read_email_id.push(this.id_string);
              this.read_email_from.push(this.from);
              this.read_email_subject.push(this.subject);
              this.read_email_body.push(this.body);
            }

            let person = new Person();
            person.From = this.email_content_list[0];
            person.Subject = this.email_content_list[1];
            person.Snippet = this.email_content_list[2];
            person.ID = this.email_content_list[3];
            person.Thread_ID = this.email_content_list[4];

            this.list_obj.push(JSON.parse(JSON.stringify(person)));
            this.email_content_list = null;
          }
          else{
            console.log("FATAL ERROR");
          }
          this.ref.detectChanges();
        })
      }
    })
  }

  //Opnen the compose div
  open_compose(){

    if(this.read_popup){
      this.read_popup = false;
      this.resetForm();
    }

    if(this.user != null){
      this.resetForm();
      this.compose_popup = true;
      this.draft_edit = false;
    }
    else{
      alert("Please Sign-In");
    }
  }

  resetForm(form? : NgForm){
    if(form != null)
      form.resetForm();

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

      this.search_obj = [];
    }
  }

  //Submit form to gmail.Service folder
  onSubmit(form : NgForm){
    let element = <HTMLInputElement> document.getElementById("check");
    if(element.checked != null && element.checked){
      this.gmailService.createDraft(this.user, form.value);
    }
    else{
      if(this.file_explorer){
        this.gmailService.sendEmail_w_attachment(this.user, form.value, this.gmailService.attachment_string, this.gmailService.attachment_type, this.gmailService.attachment_name);
        this.empty_browse();
      }
      else{
        this.gmailService.sendEmail(this.user, form.value);
      }
    }
    this.resetForm(form);
    element.checked = false;
  }

  //Update Drafts
  onUpdate(form4 : NgForm){

    let element = <HTMLInputElement> document.getElementById("check_update");
    if(element.checked != null && element.checked){
      this.gmailService.updateDraft(this.user, form4.value, this.update_draftID);
    }
    else{
      this.gmailService.sendDraft(this.user, form4.value, this.send_draftID);
    }
    this.resetForm();
    element.checked = false;

  }
  //Close compose div
  send_close(){
    this.resetForm();
    this.compose_popup = false;
  }

  //Empty content the choose file button
  empty_browse(){
    this.gmailService.attachment_name = '';
    this.file_explorer = false;
  }

  //Allow the user to search via text
  text_search(){

    if((<HTMLInputElement>document.getElementById("Search")).value && (<HTMLInputElement>document.getElementById("Search")).value.length > 2){
      this.search = true;
    }
    else{
      this.search = false;
    }

    if((<HTMLInputElement>document.getElementById("Search")).value.length >= 3 && this.search_obj.length == 0){
      var predictive_word = (<HTMLInputElement>document.getElementById("Search")).value;

      let search_param = '';
      this.search_obj = [];
      search_param = this.gmailService.formData.Search;

      for(let i = 0; i < this.list_obj.length; i++){
        if(this.list_obj[i].From.includes(search_param)){
          this.search_obj.push(this.list_obj[i]);
        }
      }
    }
    else if((<HTMLInputElement>document.getElementById("Search")).value.length == 0){
      this.resetForm();
      this.search = false;
      this.search_obj = [];
    }
  }

  //Pass reply input the gmail.Service
  onReply(form2 : NgForm){
    this.gmailService.replyEmail(this.user, form2.value, this.gmailService.current_message_ID, this.gmailService.current_Reference_ID, this.gmailService.reply_thread_ID);
    this.reply_to_thread = false;
    this.resetForm();
    
    setTimeout( () => {
      let empty_thread_obj = this.gmailService.thread_obj.length;
      for(let i = 0; i < empty_thread_obj; i++){
        this.gmailService.thread_obj.pop();

      }
      this.threadEmail(this.gmailService.reply_thread_ID);
    }, 7000 )
    
  }
  //Close reply form
  reply_close(){
    this.reply_to_thread = false;
    this.forward_thread = false;
    this.resetForm();
  }

  //Open reply form
  reply(){

    if(this.forward_thread){
      this.forward_thread = false;
      this.resetForm();
    }

    for(let i = 0; i < this.gmailService.thread_obj.length; i++){

      let email_reply: string = this.gmailService.thread_obj[i].From;
      let subject_reply: string = this.gmailService.thread_obj[i].Subject;

      this.reply_subject = subject_reply;

      let email_length = email_reply.split(" ");
      let index_length = email_length.length;

      if(email_length[index_length - 1] != "<" + this.user.getBasicProfile().getEmail() + ">"){
        this.reply_to_thread = true;
        let reply_to_sender: string = email_length[index_length - 1].replace("<", "");
        reply_to_sender = reply_to_sender.replace(">", "");
        this.sender_email = reply_to_sender;
        break
      }
    }
    this.gmailService.formData.To = this.sender_email;
    this.gmailService.formData.Subject = this.reply_subject;
  }

  //Forward emails
  onForward(form3 : NgForm){
    this.gmailService.sendEmail(this.user, form3.value);
    this.resetForm();
    this.reply_to_thread = false;
    this.forward_thread = false;
  }

  //Detect that a user select a file from File Explorer
  onNativeInputFileSelect(event: any) {
    this.gmailService.attachment_name = event.target.value.split("\\")[2];
    this.gmailService.attachment_ext = this.gmailService.attachment_name.split(".")[1];

    this.gmailService.attachment_type = this.Mime_dict[this.gmailService.attachment_ext];
    this.file_explorer = true;

    if (event.target.value) {
      const file: File = event.target.files[0];
      
      this.changeFile(file).then(
        (base64: any): any => {
          var s = String(base64).split(",");
          this.gmailService.attachment_string = s[1];
 
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
    if(this.reply_to_thread){
      this.reply_to_thread = false;
      this.resetForm();
    }
    this.forward_thread = true;

    let forward_subject = "FWD: " + this.gmailService.thread_obj[0].Subject;

    let compose_forward_body = '';

    for(let i = 0; i < this.gmailService.thread_obj.length; i++){
      compose_forward_body += this.gmailService.thread_obj[i].From + "\n" + this.gmailService.thread_obj[i].Subject + "\n" + this.gmailService.thread_obj[i].Body.replace(/<br>/g, '\n') + "\n\n";
    }

    this.gmailService.formData.Subject = forward_subject;
    this.gmailService.formData.Body = compose_forward_body;
  }
}