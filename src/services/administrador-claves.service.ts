import {injectable, /* inject, */ BindingScope} from '@loopback/core';

const generator = require('generate-password');
const CryptoJS = require("crypto-js");

@injectable({scope: BindingScope.TRANSIENT})
export class AdministradorClavesService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

CrearClavesAleatorias(): string {
    let password = generator.generate({
    length: 10,
    numbers: true,
    uppercase: true
  });

  return password;
}

CifrarTexto( texto : string ){
 let textoCifrado = CryptoJS.MD5(texto).toString();
 return textoCifrado;
}

}
