import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  messages = this.api.getMessages();
  inputForm = this.fb.nonNullable.group({
    prompt: ['', Validators.required],
  });
  minRows = 1;
  maxRows = 5;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private loadingController: LoadingController
  ) {}

  async submitPrompt() {
    console.log('SUBMIT: ', this.inputForm.getRawValue().prompt);
    const loading = await this.loadingController.create({
      message: 'Hellooo',
      spinner: 'bubbles',
    });
    await loading.present();
    await this.api.getCompletion(this.inputForm.getRawValue().prompt);
    this.inputForm.setValue({ prompt: '' });
    loading.dismiss();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent the newline insertion (default behavior of 'Enter' key)
      this.submitPrompt(); // Call your existing method to submit the form
    }
  }

  onInput(event: any): void {
    const textarea = event.target as HTMLTextAreaElement;
    
    // Reset the height to 'auto' before recalculating the new height
    textarea.style.height = 'auto';
    
    // Calculate the desired height (accounting for padding if necessary)
    const desiredHeight = Math.min(textarea.scrollHeight, this.maxRows * parseInt(getComputedStyle(textarea).lineHeight));
    
    // Set the new height (increase only if the desiredHeight is greater than the current height)
    textarea.style.height = Math.max(desiredHeight, textarea.clientHeight) + 'px';
  }

  async ngOnInit() {}
}
