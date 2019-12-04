import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  QuerySnapshot,
  DocumentSnapshot
} from "@angular/fire/firestore";
import { Observable } from "rxjs";
export class User {
  id: string;
  name: string;
  x: number;
}

@Injectable({
  providedIn: "root"
})
export class GameService {
  isLoggedin: boolean;
  user: User;
  constructor(private firestore: AngularFirestore) {}

  initUser(name: string) {
    this.firestore
      .collection("users")
      .ref.where("name", "==", name)
      .get()
      .then(index =>
        index.forEach(doc => {
          this.user = { id: doc.id, ...doc.data() } as User;
        })
      )
      .finally(() => {
        if (!this.user) {
          this.firestore.collection("users").add({ name: name, x: 500 });
        }
      });
  }
}
