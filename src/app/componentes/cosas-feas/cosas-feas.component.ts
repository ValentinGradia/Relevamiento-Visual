import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FotosService } from 'src/app/services/fotos.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { getStorage, ref, listAll, getDownloadURL, uploadString } from 'firebase/storage';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, arrayUnion } from 'firebase/firestore';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Chart, ChartType, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Photo } from '../cosas-lindas/cosas-lindas.component';

@Component({
  standalone : true,
  imports : [FormsModule, CommonModule, RouterModule],
  selector: 'app-cosas-feas',
  templateUrl: './cosas-feas.component.html',
  styleUrls: ['./cosas-feas.component.scss'],
})
export class CosasFeasComponent  implements OnInit {

  fotos : Array<Photo> = [];
  images: string[] = [];
  private chart: Chart | null = null;

  url !: string;
  imageUrl: string | null = null;

  cargando : boolean = false;
  desplegarLikes : boolean = false;

  nombreFoto: string = '';
  correoUsuario !: string;

  selectedImage: string | ArrayBuffer | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('barras') barras!: ElementRef<HTMLCanvasElement>;

  constructor(private fotosService : FotosService, private usuario: UsuarioService, private storage: AngularFireStorage) {
    Chart.register(...registerables,ChartDataLabels);
   }

  ngOnInit() {
    this.correoUsuario = this.usuario.correo;
    this.cargarFotos();
  }

  async cargarFotos() {
    this.cargando = true;
    const firestore = getFirestore();
    const photosCollection = collection(firestore, 'Feas');
    
    const photoSnapshots = await getDocs(photosCollection);
    
    this.fotos = photoSnapshots.docs.map(doc => {
      const data = doc.data() as any;
      const fechaTimestamp = data.fecha;
      const fechaDate = fechaTimestamp.toDate();
        // console.log(data.createdAt.valueOf());
        console.log(data.fecha);
        return {
            id: doc.id,
            url: data.url,
            correo: data.correo,
            fecha: fechaDate,
            likes: data.likes || [],
            nombre: data.nombre
        };
    });

    this.fotos.sort((a : any, b : any) => b.fecha - a.fecha);

    this.cargando = false;

  }

  async sacarFoto(): Promise<void> {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    // Verificar que el data URL sea válido antes de intentar subirlo
    if (image && image.dataUrl) {
      this.cargando = true;
          try {
            const storage = getStorage();
            const storageRef = ref(storage, `images/${new Date().getTime()}.jpeg`);
            // subir la imagen a firebase
            await uploadString(storageRef, image.dataUrl, 'data_url');
            //console.log('Imagen subida exitosamente');

            const photoUrl = await getDownloadURL(storageRef);
            const correo = this.usuario.correo;
            const createdAt = new Date();

            // guardamos en firestore
            const firestore = getFirestore();
            const photoData = {
              url: photoUrl,
              correo: correo,
              fecha: createdAt,
              likes: [],
              nombre: this.nombreFoto
            };

            //blanqueamos el nombre de la foto para que el input quede vacio
            this.nombreFoto = '';

            //agregamos la foto a firestore
            await addDoc(collection(firestore, 'Feas'), photoData);
            this.cargando = false;
            //this.volverFotos();

            //volvemos a cargar la pagina
            this.cargarFotos(); 
          } catch (error) {
            console.error('Error al subir la imagen:', error);
          }
    } else {
      console.error('No se seleccionó ningún archivo.');
    }
  }


  tomarFoto()
  {
    var contenedor = document.getElementById('contenedor');
    contenedor!.style.display = 'flex';
    contenedor!.style.flexDirection = 'column';
    contenedor!.style.justifyContent = 'center';

    var fotos = document.getElementById('fotos');
    fotos!.style.display = 'none';

    var footer = document.getElementById('footer');
    footer!.style.display = 'none';
  }

  async darLike(foto: Photo)
  {
    if(!foto.likes.includes(this.correoUsuario))
    {
      const firestore = getFirestore();
      const fotoRef = doc(firestore, 'Feas', foto.id);
  
      await updateDoc(fotoRef, {
        likes : arrayUnion(this.correoUsuario)
      });

      this.cargarFotos();
    }

  }

  sacarLikes(){
    var cont = document.getElementById('contenedor-likes');
    cont!.style.display = 'none';
    this.desplegarLikes = false;
  }

  mostrarLikesBarras()
  {
    this.desplegarLikes = true;

    var cont = document.getElementById('contenedor-likes');
    cont!.style.display = 'block';

    var valorMayor = this.fotos.reduce((a,b) => (a.likes.length > b.likes.length ? a : b), this.fotos[0]);
    console.log(valorMayor);

    const context = this.barras.nativeElement.getContext('2d');

    if(context)
    {
      new Chart(
        context,
        {
          type: 'bar',
          data: {
            labels: this.fotos.map(foto => foto.nombre),
            datasets: [
              {
                label: 'Likes',
                data: this.fotos.map(foto => foto.likes.length)
              }
            ]
          },
          options : {
            scales : {
              y: {
                beginAtZero: true, 
                ticks: {
                  stepSize: 1,
                }
              }
            }
          }
        }
      )
    }
    
  }

  volverFotos()
  {
    var contenedor = document.getElementById('contenedor');
    contenedor!.style.display = 'none';

    var fotos = document.getElementById('fotos');
    fotos!.style.display = 'block';

    var footer = document.getElementById('footer');
    footer!.style.display = 'flex';
  }

}