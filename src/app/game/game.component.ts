import { Component, OnInit } from "@angular/core";
import { GameService, User } from "../game.service";
import { HostListener } from "@angular/core";
import { pipe, Observable } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";

export class Message {
  text: string;
  user: {
    id: string;
    name: string;
  };
  date: any;
}
@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.scss"]
})
export class GameComponent implements OnInit {
  chat: Observable<Message[]>;

  constructor(
    private gameService: GameService,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAuthentication();
    this.chat = this.firestore
      .collection<Message>("chat", ref => ref.orderBy("date").limitToLast(7))
      .valueChanges();
  }

  checkAuthentication() {
    if (this.gameService.user == undefined) {
      this.router.navigate(["/auth"]);
    }
  }

  commitText() {
    let text: string = (document.getElementById("chat-input") as any).value;
    if (text == "") {
      return;
    }

    (document.getElementById("chat-input") as any).value = "";
    document.getElementById("chat-input").blur();

    let messgae: Message = {
      text: text,
      user: this.gameService.user,
      date: new Date()
    };

    this.firestore.collection("chat").add(messgae);
  }

  @HostListener("document:keypress", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == "Enter") {
      document.getElementById("chat-input").focus();
    }
  }
}
