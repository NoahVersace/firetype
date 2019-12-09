import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import { GameService, User } from "../game.service";
import { HostListener } from "@angular/core";
import { pipe, Observable, of, BehaviorSubject } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { keyframes } from "@angular/animations";
import { Key } from "protractor";
import { filter, map, last, first, endWith } from "rxjs/operators";
import { analytics } from "firebase";

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
export class GameComponent implements OnInit, AfterViewInit {
  chat: Observable<Message[]>;
  goingLeft: boolean;
  goingRight: boolean;
  x: BehaviorSubject<number>;
  lastX;
  user;
  players: Observable<any[]>;
  playerList: any[] = new Array();

  constructor(
    private gameService: GameService,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  ngAfterViewInit() {
    this.chat.subscribe(x =>
      setTimeout(
        () => (document.getElementById("chat-box").scrollTop = 99999),
        0
      )
    );

    this.players.subscribe(players =>
      players.forEach(player => {
        if (!this.playerList.some(item => item.name == player.name)) {
          if (player.isActive == true) {
            this.playerList.push(player);
            setTimeout(() => {
              if (document.getElementById("player-" + player.name)) {
                document.getElementById("player-" + player.name).style.left =
                  player.x + "%";
              }
            }, 0);
          }
        } else {
          if (player.isActive == false) {
            this.playerList = this.playerList.filter(
              playerObj => playerObj.name !== player.name
            );
          }
        }
      })
    );

    this.players.subscribe(list =>
      list.forEach(player => {
        this.playerList.forEach(listItem => {
          if (document.getElementById("player-" + player.name)) {
            document.getElementById("player-" + player.name).style.left =
              player.x + "%";
          }
        });
      })
    );
  }

  ngOnInit() {
    this.checkAuthentication();

    this.chat = this.firestore
      .collection<Message>("chat", ref => ref.orderBy("date").limitToLast(50))
      .valueChanges();

    let userId = this.gameService.user.id;
    let userX = this.gameService.user.x;

    this.user = this.firestore
      .collection("users")
      .doc(userId)
      .valueChanges();

    this.x = new BehaviorSubject(userX);
    this.lastX = userX;
    this.x.subscribe(x => {
      document.getElementById("player").style.left = x + "%";
    });

    setInterval(() => this.movePlayer(), 10);
    setInterval(() => this.updatePlayerLocation(), 300);

    this.players = this.firestore
      .collection<User>("users")
      .valueChanges()
      .pipe(
        map(list => {
          return list.filter(cb => cb.name != this.gameService.user.name);
        })
      );

    window.addEventListener("beforeunload", event => {
      event.returnValue = "";
      this.gameService.setActive(false);
    });
  }

  updatePlayerLocation() {
    if (this.lastX != this.x.value) {
      this.firestore
        .collection("users")
        .doc(this.gameService.user.id)
        .update({ x: this.gameService.user.x });
      this.lastX = this.x.value;
    }
  }

  movePlayer() {
    let distance = 0.5;
    if (this.goingLeft && this.x.value - distance >= 0) {
      this.x.next(this.x.value - distance);
      this.gameService.user.x = this.gameService.user.x - distance;
    } else if (this.goingRight && this.x.value + distance <= 100) {
      this.x.next(this.x.value + distance);
      this.gameService.user.x = this.gameService.user.x + distance;
    }
  }

  redirectToNoah() {
    window.open("https://noahsalvi.ch");
  }

  checkAuthentication() {
    if (!this.gameService.isLoggedin) {
      this.router.navigate(["/auth"]);
    }
  }

  commitText() {
    let text: string = (document.getElementById("chat-input") as any).value;
    if (text == "") {
      // document.getElementById("chat-input").blur();
      return;
    } else {
      (document.getElementById("chat-input") as any).value = "";
      // document.getElementById("chat-input").blur();

      let messgae: Message = {
        text: text,
        user: this.gameService.user,
        date: new Date()
      };

      this.firestore.collection("chat").add(messgae);
    }
  }

  @HostListener("document:keydown", ["$event"])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.gameService.user.isActive) {
      this.gameService.setActive(true);
    }
    if (document.activeElement != document.getElementById("chat-input")) {
      if (event.key == "Enter") {
        document.getElementById("chat-input").focus();
      }
    } else {
      if (event.key == "Enter") {
        document.getElementById("chat-input").blur();
      }
    }

    if (document.activeElement != document.getElementById("chat-input")) {
      if (event.key == "a") {
        this.goingLeft = true;
      } else if (event.key == "d") {
        this.goingRight = true;
      }
    }
  }
  @HostListener("document:keyup", ["$event"])
  handleKeyUp(event: KeyboardEvent) {
    if (event.key == "a" && this.goingLeft) {
      this.goingLeft = false;
    } else if (event.key == "d" && this.goingRight) {
      this.goingRight = false;
    }
  }
}
