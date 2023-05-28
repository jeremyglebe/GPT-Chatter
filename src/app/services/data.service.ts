import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface Message {
  role: string;
  content: string;
  timestamp: Date;
}

export interface Chat {
  name: string;
  messages: Message[];
  lastEdited: Date;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private _chats: Map<string, Chat> = new Map();
  private _apiKey: string | null = null;
  private _apiKeyLastUpdated: Date | null = null;
  private _ready = false;

  constructor(private storage: Storage) {}

  /** Gets the service ready to use, does nothing if already ready */
  public async ready() {
    if (!this._ready) {
      const storage = await this.storage.create();
      this.storage = storage;
      await this._loadChats();
      await this._loadApiKey();
      this._ready = true;
    }
  }

  // Loads chats from local storage
  private async _loadChats() {
    const savedChats = await this.storage.get('chats');
    if (savedChats) {
      this._chats = new Map(JSON.parse(savedChats));
    }
  }

  // Saves chats to local storage
  private async _saveChats() {
    await this.storage.set(
      'chats',
      JSON.stringify(Array.from(this._chats.entries()))
    );
  }

  // Loads the API key from local storage
  private async _loadApiKey() {
    const apiKey = await this.storage.get('apiKey');
    if (apiKey) {
      this._apiKey = apiKey;
    }
  }

  // Saves the API key to local storage
  private async _saveApiKey() {
    await this.storage.set('apiKey', this._apiKey);
  }

  // Getter for the API key
  public get key(): string | null {
    return this._apiKey;
  }

  // Setter for the API key
  public set key(apiKey: string | null) {
    this._apiKey = apiKey;
    this._saveApiKey();
    this._apiKeyLastUpdated = new Date();
  }

  // Async getter for the API key
  public async getKey(): Promise<string | null> {
    await this.ready();
    return this.key;
  }

  // Async setter for the API key
  public async setKey(apiKey: string | null): Promise<void> {
    await this.ready();
    this.key = apiKey;
  }

  // Getter for chats
  public get chats(): Map<string, Chat> {
    return this._chats;
  }

  // Get the chats as an array
  public get chatsList(): Chat[] {
    return Array.from(this._chats.values());
  }

  // Async getter for chats
  public async getChats(): Promise<Map<string, Chat>> {
    await this.ready();
    return this.chats;
  }

  // Async getter for chats as an array
  public async getChatsList(): Promise<Chat[]> {
    await this.ready();
    return this.chatsList;
  }

  // Creates a new chat if it doesn't exist yet
  public async createChat(chatName: string) {
    if (!this._chats.has(chatName)) {
      this._chats.set(chatName, {
        name: chatName,
        messages: [],
        lastEdited: new Date(),
      });
    }
    await this._saveChats();
  }

  /** Deletes all chats from local storage */
  public async deleteChats() {
    this._chats = new Map();
    await this._saveChats();
  }

  public addMessage(conversationName: string, message: Message) {
    if (!this._chats.has(conversationName)) {
      this._chats.set(conversationName, {
        name: conversationName,
        messages: [],
        lastEdited: new Date(),
      });
    }
    const existingConversation = this._chats.get(conversationName);
    if (existingConversation) {
      existingConversation.messages.push(message);
      existingConversation.lastEdited = new Date();
    }
    this._saveChats();
  }

  public importDataFromJson(jsonData: any) {
    const data = JSON.parse(jsonData);
    const chatsJson = data.chats;
    const apiKeyJson = data.apiKey;

    // Import chats
    if (chatsJson) {
      chatsJson.forEach((conversationJson: any) => {
        const existingConversation = this._chats.get(conversationJson.name);
        const newConversation: Chat = {
          name: conversationJson.name,
          messages: conversationJson.messages,
          lastEdited: new Date(conversationJson.lastEdited),
        };

        if (
          !existingConversation ||
          existingConversation.lastEdited < newConversation.lastEdited
        ) {
          this._chats.set(conversationJson.name, newConversation);
        }
      });
      this._saveChats();
    }

    // Import API key
    if (
      (apiKeyJson && !this._apiKey) ||
      (this._apiKeyLastUpdated &&
        Date.parse(data.apiKeyLastUpdated) > this._apiKeyLastUpdated.valueOf())
    ) {
      this._apiKey = apiKeyJson;
      this._saveApiKey();
    }
  }

  public exportDataToJson() {
    const data = {
      chats: Array.from(this._chats.values()),
      apiKey: this._apiKey,
      apiKeyLastUpdated: this._apiKeyLastUpdated,
    };
    return JSON.stringify(data);
  }
}
