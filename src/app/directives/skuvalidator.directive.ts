import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, AsyncValidator } from '@angular/forms';
import { PrendasService } from '../services/prendas.service';
import { Prenda } from '../models/prenda';

@Directive({
  selector: '[appSkuvalidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: SkuvalidatorDirective, multi: true}]
})
export class SkuvalidatorDirective implements AsyncValidator {

  @Input() prenda:Prenda = null;

  constructor(private ps:PrendasService) {
  }
  
  validate(control:AbstractControl){
    let promesa = new Promise((resolve,reject)=>{
      this.ps.getPrendaBySku(control.value.trim()).subscribe((data:any[]) => {
       
        if(data.length > 0){
          resolve({existe: true});
        } else {
          resolve(null);  
        }
      });
    });   
    return promesa;
  }

}
