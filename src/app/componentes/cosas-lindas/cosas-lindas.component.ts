import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FotosService } from 'src/app/services/fotos.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { getStorage, ref, listAll, getDownloadURL, uploadString } from 'firebase/storage';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, arrayUnion, Timestamp } from 'firebase/firestore';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Chart, ChartType, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export interface Photo {
  id: string;
  url: string;
  correo: string;
  fecha: Date;
  likes: Array<any>;
  nombre: string; // Nuevo campo
}
@Component({
  standalone : true,
  imports :  [FormsModule, CommonModule, RouterModule],
  selector: 'app-cosas-lindas',
  templateUrl: './cosas-lindas.component.html',
  styleUrls: ['./cosas-lindas.component.scss'],
})
export class CosasLindasComponent  implements OnInit {


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
  @ViewChild('tortas') tortas!: ElementRef<HTMLCanvasElement>;

  constructor(private fotosService : FotosService, private usuario: UsuarioService, private storage: AngularFireStorage) {
    Chart.register(...registerables,ChartDataLabels);
   }

  async ngOnInit() {
    this.correoUsuario = this.usuario.correo;
    // this.desplegarLikes = true;
    this.cargarFotos();
  }


  async cargarFotos() {
    //Si cargando es true se muestra mi pantalla modal de cargando
    this.cargando = true;
    const firestore = getFirestore();
    const photosCollection = collection(firestore, 'Fotos');
    
    const photoSnapshots = await getDocs(photosCollection);
    
    this.fotos = photoSnapshots.docs.map(doc => {
        const data = doc.data() as any;
        const fechaTimestamp = data.fecha;
        const fechaDate = fechaTimestamp.toDate();
        //console.log(data.fecha);
        return {
            id: doc.id,
            url: data.url,
            correo: data.correo,
            fecha: fechaDate,
            likes: data.likes || [],
            nombre: data.nombre
        };
    });

    //ordenamos por fecha
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
            console.log('Imagen subida exitosamente');

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
            await addDoc(collection(firestore, 'Fotos'), photoData);
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


  mostrarLikes()
  {
    this.desplegarLikes = true;
    var cont = document.getElementById('contenedor-likes');
    cont!.style.display = 'block';

    const context = this.tortas.nativeElement.getContext('2d');

    //var nombresFotos = this.fotos.map(foto => foto.nombre);

    if (context) {

      const fotosConLikes = this.fotos.filter(foto => foto.likes.length > 0);

      new Chart(context, {
        type: 'pie' as ChartType,
        data: {
          labels: fotosConLikes.map(foto => foto.nombre),
          datasets: [
            {
              data: fotosConLikes.map(foto => foto.likes.length),
              backgroundColor: fotosConLikes.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`),
              borderColor: '#fff',
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.label}: ${context.raw} likes`;
                },
              },
            },
            datalabels: {
              color: '#fff',
              formatter: (value, context) => {
                return context.chart.data.labels![context.dataIndex];
              },
            },
          },
        },
        plugins: [ChartDataLabels], 
      });
    }
  }


  //Primero ingresa el nombre de la foto por lo que hacemos visible el contenedor
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
    //Solo se va a poder dar like si el array de likes no contiene el usuario logueado
    if(!foto.likes.includes(this.correoUsuario))
    {
      const firestore = getFirestore();
      const fotoRef = doc(firestore, 'Fotos', foto.id);
      await updateDoc(fotoRef, {
        likes : arrayUnion(this.correoUsuario)
      });

      this.cargarFotos();
    }

  }

  //En caso de volver hacia las fotos hacemos que el contenedor de likes no sea visible
  sacarLikes(){
    var cont = document.getElementById('contenedor-likes');
    cont!.style.display = 'none';
    this.desplegarLikes = false;
  }

  //Desplegar las fotos 
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
