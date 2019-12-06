import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import { GameService, User } from "../game.service";
import { HostListener } from "@angular/core";
import { pipe, Observable, of, BehaviorSubject } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { keyframes } from "@angular/animations";
import { Key } from "protractor";
import { filter, map, last } from "rxjs/operators";
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

  constructor(
    private gameService: GameService,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  ngAfterViewInit() {
    let cooldown = 500;
    this.players.subscribe(players =>
      setTimeout(() => {
        players.forEach((player, index) => {
          console.log(index + " " + player.x);
          document.getElementById("player-" + index).style.left =
            player.x + "%";
          cooldown = 0;
        });
      }, cooldown)
    );
  }

  ngOnInit() {
    this.checkAuthentication();

    this.chat = this.firestore
      .collection<Message>("chat", ref => ref.orderBy("date").limitToLast(7))
      .valueChanges();

    let userId = this.gameService.user.id;
    let userX = this.gameService.user.x;

    this.user = this.firestore
      .collection("users")
      .doc(userId)
      .valueChanges();

    this.players = this.firestore
      .collection<User>("users", ref => ref.where("isActive", "==", true))
      .valueChanges()
      .pipe(
        map(list => list.filter(cb => cb.name != this.gameService.user.name))
      );

    this.x = new BehaviorSubject(userX);
    this.lastX = userX;
    this.x.subscribe(x => {
      document.getElementById("player").style.left = x + "%";
    });

    setInterval(() => this.movePlayer(), 10);
    setInterval(() => this.updatePlayerLocation(), 1000);

    window.addEventListener("beforeunload", () =>
      this.gameService.setActive(false)
    );
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
    if (this.goingLeft) {
      this.x.next(this.x.value - distance);
      this.gameService.user.x = this.gameService.user.x - distance;
    } else if (this.goingRight) {
      this.x.next(this.x.value + distance);
      this.gameService.user.x = this.gameService.user.x + distance;
    }
  }

  checkAuthentication() {
    if (!this.gameService.isLoggedin) {
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

  @HostListener("document:keydown", ["$event"])
  handleKeyDown(event: KeyboardEvent) {
    console.log("true");
    // console.log(event);^
    if (event.key == "Enter") {
      document.getElementById("chat-input").focus();
    } else if (event.key == "a") {
      this.goingLeft = true;
    } else if (event.key == "d") {
      // this.x.next(30);
      this.goingRight = true;
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
