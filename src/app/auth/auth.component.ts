import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { GameService } from "../game.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.scss"]
})
export class AuthComponent implements OnInit {
  constructor(
    private toaster: ToastrService,
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit() {}

  enterPressed() {
    let input: any = document.getElementById("name-input");
    if (input.value.length > 0) {
      this.gameService.initUser(input.value);
      this.toaster.clear();
      this.toaster.success("You're logged in");
      console.log("navigated");
    } else {
      this.toaster.error("Enter a username");
    }
  }
}
