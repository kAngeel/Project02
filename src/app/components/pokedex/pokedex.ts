import { Component, OnInit, signal } from '@angular/core';
import { PokedexService, Pokemon, PokemonDetail } from '../../services/pokedex';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pokedex',
  imports: [FormsModule],
  styleUrl: './pokedex.css',
  templateUrl: './pokedex.html',
})
export class PokedexComponent implements OnInit {
  pokemon = signal<Pokemon[]>([]);
  filteredPokemon = signal<Pokemon[]>([]);
  searchTerm = signal('');
  selectedPokemon = signal<PokemonDetail | null>(null);
  loadingDetail = signal(false);

  constructor(private pokedexService: PokedexService) {}

  get loading(): boolean {
    return this.pokedexService.loading();
  }

  get error(): string | null {
    return this.pokedexService.error();
  }

  ngOnInit(): void {
    this.pokedexService.loadPokemons(151, 0);
    this.pokedexService.pokemon$.subscribe((data) => {
      this.pokemon.set(data);
      this.filterPokemon();
    });
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value.trim().toLowerCase());
    this.filterPokemon();
  }

  filterPokemon() {
    const term = this.searchTerm();
    const all = this.pokemon();
    if (!term) {
      this.filteredPokemon.set(all);
      return;
    }
    this.filteredPokemon.set(
      all.filter(
        (p) =>
          p.name.toLowerCase().includes(term) || p.id.toString().includes(term)
      )
    );
  }

  getPokemonDetails(idOrName: string | number) {
    this.loadingDetail.set(true);
    this.pokedexService.getPokemonByIdOrName(idOrName).subscribe({
      next: (detail) => this.selectedPokemon.set(detail),
      error: () => {
        this.loadingDetail.set(false);
        this.pokedexService.error.set('Error fetching Pokémon details');
      },
      complete: () => this.loadingDetail.set(false),
    });
  }

  closeDetails() {
    this.selectedPokemon.set(null);
  }
}