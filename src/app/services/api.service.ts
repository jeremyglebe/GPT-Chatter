import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Configuration, OpenAIApi } from 'openai';
import { BehaviorSubject } from 'rxjs';
import { DataService } from './data.service';

const configuration = new Configuration({
  apiKey: environment.OPENAI_API_KEY,
});
delete configuration.baseOptions.headers['User-Agent'];
const openai = new OpenAIApi(configuration);

interface Message {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  starterMessages: Message[] = [
    {
      content: 'You are a helpful assistant.',
      role: 'system',
    },
  ];
  private messages = new BehaviorSubject<Message[]>(this.starterMessages);

  constructor(private http: HttpClient, private data: DataService) {}

  async getCompletion(prompt: string) {
    const newMessage: Message = {
      content: prompt,
      role: 'user',
    };
    this.messages.next([...this.messages.getValue(), newMessage]);

    const aiResult = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [...this.messages.getValue()],
    });

    const response =
      aiResult.data.choices[0].message?.content?.trim() ||
      'Sorry, there was a problem!';

    const botMessage: Message = {
      content: response,
      role: 'assistant',
    };

    this.messages.next([...this.messages.getValue(), botMessage]);
    return true;
  }

  getMessages() {
    return this.messages.asObservable();
  }
}
