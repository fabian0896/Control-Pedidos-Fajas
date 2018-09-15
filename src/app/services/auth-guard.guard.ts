import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";
import { AngularFireAuth } from 'angularfire2/auth';
import { LoginService } from './login.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuardGuard implements CanActivate {
  
  constructor(public afAuth: AngularFireAuth, public router: Router){

  }
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
     return this.afAuth.authState.pipe(map(data =>{
        if(data){
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
     }));
  }
}
