import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  QuerySnapshot,
  DocumentSnapshot
} from "@angular/fire/firestore";
import { Observable, of } from "rxjs";
import { Router } from "@angular/router";

export class User {
  id: string;
  name: string;
  x: number;
  isActive: boolean;
}

@Injectable({
  providedIn: "root"
})
export class GameService {
  isLoggedin: boolean;
  user: User;
  constructor(private firestore: AngularFirestore, private router: Router) {}

  initUser(name: string) {
    this.isLoggedin = true;
    this.firestore
      .collection("users")
      .ref.where("name", "==", name)
      .get()
      .then(index =>
        index.forEach(doc => {
          this.user = { id: doc.id, ...doc.data(), isActive: true } as User;
          this.router.navigate(["/"]);
          this.firestore
            .collection("users")
            .doc(this.user.id)
            .update({ isActive: true });
        })
      )
      .finally(() => {
        if (!this.user) {
          this.firestore
            .collection("users")
            .add({ name: name, x: 50, isActive: true })
            .then(cb =>
              cb.get().then(doc => {
                this.user = {
                  id: doc.id,
                  ...doc.data()
                } as User;
                this.router.navigate(["/"]);
              })
            );
        }
      });
  }

  setActive(isActive: boolean) {
    this.user.isActive = isActive;
    this.firestore
      .collection("users")
      .doc(this.user.id)
      .update({ isActive: isActive });
  }

  getObservableUser(): Observable<User> {
    return this.firestore
      .collection("users")
      .doc(this.user.id)
      .valueChanges() as Observable<User>;
  }
}
