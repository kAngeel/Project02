import { Routes } from '@angular/router';
import { PokedexComponent } from './components/pokedex/pokedex';

export const routes: Routes = [
  {
    path: 'pokedex',
    component: PokedexComponent,
    title: 'Pokédex',
  },
  {
    path: '',
    redirectTo: 'pokedex',
    pathMatch: 'full',
  },
  {
    // Fallback para GitHub Pages: cualquier ruta desconocida va al Pokédex
    path: '**',
    redirectTo: 'pokedex',
  },
];