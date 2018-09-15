import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'colorEstadoPrenda',
  pure: false
})
export class ColorEstadoPrendaPipe implements PipeTransform {

  transform(value: number): string {
    if(value == 0 || value == null){
      return "";
    } else if ( value == 1) {
      return "red lighten-4"
    } else if ( value == 2){
      return "light-green lighten-4";
    }
    
  }

}
