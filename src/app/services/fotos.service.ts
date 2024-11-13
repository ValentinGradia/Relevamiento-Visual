import { Injectable } from '@angular/core';
// import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { getStorage, ref, uploadBytes, uploadString } from "firebase/storage";
import { finalize, map } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FotosService {

  constructor(private storage : AngularFireStorage, private firestore : AngularFirestore) { }


  async agregarFoto(nombre: string, url: string, likes : number)
  {
    try
    {
      await this.firestore.collection('Fotos').add({
        Nombre: nombre,
        Url : url,
        Likes : likes
      });
    }
    catch(error){throw error}
  }

  // subirFoto(file : any, path: string, nombre: string): Promise<string> {
  //   return new Promise( resolve => {

  //     const filePath = path + '/' + nombre;
  //     const ref = this.storage.ref(filePath);
  //     const task = ref.put(file);

  //     task.snapshotChanges().pipe(
  //       finalize(() => {
  //         ref.getDownloadURL().subscribe(res => {
  //           const downloadUrls = res
  //         });
  //       })
  //     )
  //     .subscribe();
  //     resolve("este es el enlace:");
  //   });
    // fetch(url)
    //   .then(response => response.blob())
    //   .then(blob => {
    //     const reader = new FileReader();
    //     reader.onloadend = () => {
    //       const base64data = reader.result as string;
    //       uploadString(storageRef, base64data, 'data_url')
    //         .then(() => {
    //           console.log('Foto subida exitosamente!');
    //         })
    //         .catch(error => {
    //           console.error('Error al subir la foto:', error);
    //         });
    //     };
    //     reader.readAsDataURL(blob); 
    //   })
    //   .catch(error => {
    //     console.error('Error al obtener la imagen:', error);
    //   });
  
}
