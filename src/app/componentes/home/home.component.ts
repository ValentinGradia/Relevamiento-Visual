import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  standalone : true,
  imports : [FormsModule, RouterModule, CommonModule],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent  implements OnInit {

  constructor(private router: Router, private usuario: UsuarioService) { }

  ngOnInit() {}


  cerrarSesion() : void
  {
    this.usuario.correo = '';
    this.router.navigateByUrl('/inicio');
  }

}
