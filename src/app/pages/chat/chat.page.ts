import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild('userInputEl')
  userInputEl: ElementRef<HTMLTextAreaElement> | null = null;
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
      message: 'GPT is thinking...',
      spinner: 'bubbles',
    });
    await loading.present();
    await this.api.getCompletion(this.inputForm.getRawValue().prompt);
    this.inputForm.setValue({ prompt: '' });
    this.resizeUserInput();
    loading.dismiss();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent the newline insertion (default behavior of 'Enter' key)
      this.submitPrompt(); // Call your existing method to submit the form
    }
  }

  onUserInput(event: any): void {
    this.resizeUserInput();
  }

  resizeUserInput() {
    const textarea = this.userInputEl?.nativeElement;

    if (textarea) {
      // Reset the height to 'auto' before recalculating the new height
      textarea.style.height = 'auto';

      // Calculate the desired height (accounting for padding if necessary)
      const desiredHeight = Math.min(
        textarea.scrollHeight,
        this.maxRows * parseInt(getComputedStyle(textarea).lineHeight)
      );

      // Set the new height (increase only if the desiredHeight is greater than the current height)
      textarea.style.height =
        Math.max(desiredHeight, textarea.clientHeight) + 'px';
    }
  }

  async ngOnInit() {}
}
