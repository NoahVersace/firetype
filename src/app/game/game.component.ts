import { Component, OnInit } from "@angular/core";
import { GameService } from "../game.service";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.scss"]
})
export class GameComponent implements OnInit {
  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.checkAuthentication();
  }

  checkAuthentication() {
    if (this.gameService.user != undefined) {
      console.log("user is authenticated");
    }
  }
}
