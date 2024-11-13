import { Routes } from '@angular/router';
import { InicioComponent } from './componentes/inicio/inicio.component';
import { HomeComponent } from './componentes/home/home.component';
import { CosasLindasComponent } from './componentes/cosas-lindas/cosas-lindas.component';
import { CosasFeasComponent } from './componentes/cosas-feas/cosas-feas.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./splash/splash.component').then( m => m.SplashPage)
  },
  {
    path: 'splash',
    loadComponent: () => import('./splash/splash.component').then( m => m.SplashPage)
  },
  {
    path : 'inicio',
    component : InicioComponent
  },
  {
    path : 'home',
    component : HomeComponent
  },
  {
    path : 'lindas',
    component : CosasLindasComponent
  },
  {
    path : 'feas',
    component : CosasFeasComponent
  }
];
