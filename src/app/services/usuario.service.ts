import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {


  correo : string = '';

  constructor(private firestore: AngularFirestore) { }

  async agregarUsuario(sexo: string, perfil: string, correo: string, contrasenia: string)
  {
    try
    {
      this.verificarCorreo(correo);
      await this.firestore.collection('Usuarios').add({
        Correo: correo,
        Contraseña: contrasenia,
        Sexo: sexo,
        Perfil: perfil
      });
      
    }
    catch(error){throw error}
  }

  async verificarCorreo(correo : string)
  {
    var usuarios = this.firestore.collection('Usuarios');
    var querySnapshot = await usuarios.ref.where("Correo",'==',correo).get();

    if(!querySnapshot.empty)
    {
      throw Error("Correo en uso");
    }
  }

  async verificarUsuarioLogin(correo : string, contrasenia: string)
  {
    try
    {
      var clave : number = parseInt(contrasenia);
      var usuarios = this.firestore.collection('Usuarios'); //base de datos usuarios
      var querySnapshot = await usuarios.ref.where('Correo','==',correo).where('Clave','==',clave).get(); //query para obtener los datos de la bbdd
      //retorna un documento de datos

      if(!querySnapshot.empty)
      {
        var doc = querySnapshot.docs[0]; 
        //console.log(doc.id,'=>',doc.data());
        this.correo = correo;
        return doc;
      }
      else
      {
        throw new Error("Usuario no existente");
      }


    }catch(error){ throw error}
  }
}
