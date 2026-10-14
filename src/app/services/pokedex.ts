import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Pokemon {
  id: number;
  name: string;
  url: string;
  image?: string;
  types?: string[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  image?: string;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  stats: { name: string; base: number }[];
}

@Injectable({ providedIn: 'root' })
export class PokedexService {
  private readonly apiUrl = 'https://pokeapi.co/api/v2';

  private pokemonSubject = new BehaviorSubject<Pokemon[]>([]);
  pokemon$ = this.pokemonSubject.asObservable();

  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  private extractId(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]) || 0;
  }

  loadPokemons(limit = 151, offset = 0) {
    this.loading.set(true);
    this.error.set(null);
    this.http
      .get(`${this.apiUrl}/pokemon?limit=${limit}&offset=${offset}`)
      .pipe(
        map((res: any) =>
          res.results.map((p: any) => {
            const id = this.extractId(p.url);
            return {
              id,
              name: p.name,
              url: p.url,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            };
          })
        ),
        catchError((err) => {
          this.error.set('Error loading Pokédex');
          return of([]);
        })
      )
      .subscribe({
        next: (data) => this.pokemonSubject.next(data),
        complete: () => {
          this.loading.set(false);
        },
      });
  }

  getPokemonByIdOrName(idOrName: string | number): Observable<PokemonDetail> {
    return this.http.get(`${this.apiUrl}/pokemon/${idOrName}`).pipe(
      map((res: any) => ({
        id: res.id,
        name: res.name,
        image: res.sprites.other['official-artwork'].front_default,
        height: res.height,
        weight: res.weight,
        types: res.types.map((t: any) => t.type.name),
        abilities: res.abilities.map((a: any) => a.ability.name),
        stats: res.stats.map((s: any) => ({
          name: s.stat.name,
          base: s.base_stat,
        })),
      }))
    );
  }
}