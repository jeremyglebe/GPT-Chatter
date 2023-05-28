import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { DataService, Chat } from 'src/app/services/data.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  public chats: Chat[] = [];

  constructor(private data: DataService, private alerts: AlertController) {}

  ngOnInit() {
    this.loadChats();
  }

  async loadChats() {
    this.chats = await this.data.getChatsList();
  }

  async onNewChat() {
    // Create a popup ion alert where the user can enter the name of the new chat
    // https://ionicframework.com/docs/api/alert (Look more at alertController for styling?)
    const alert = await this.alerts.create({
      header: 'New Chat',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Chat Name',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Create',
          handler: async (data) => {
            await this.data.createChat(data.name);
            await this.loadChats();
          },
        },
      ],
    });
    await alert.present();
  }

  async onClearConversations() {
    await this.data.deleteChats();
    await this.loadChats();
  }
}
