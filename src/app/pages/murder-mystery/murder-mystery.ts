import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database'; // Achte darauf, dass der Pfad stimmt
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-murder-mystery',
  standalone: true, // Falls das bei dir in Angular 18+ Standard ist
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './murder-mystery.html',
  styleUrl: './murder-mystery.scss',
})
export class MurderMystery implements OnInit { // <-- Wichtig: implements OnInit hinzugefügt
  
  // 1. Hier fehlen die Variablen, die das HTML-Template braucht
  query: string = "SELECT * FROM Polizeibericht;";
  result: any = null;
  error: string | null = null;
  isLoading = true;

  constructor(private dbService: DatabaseService) {}

  async ngOnInit() {
    try {
      // Sag dem Service: Gib mir die Krimi DB!
      await this.dbService.initDatabase('murder'); 
      this.isLoading = false;
      this.runQuery(); // Führt die Query direkt beim Laden einmal aus
    } catch (e: any) {
      // 2. Das '...' durch echtes Error-Handling ersetzt
      console.error("Datenbank-Fehler:", e);
      this.error = `Fehler beim Laden der Krimi-Datenbank: ${e.message || e}`;
      this.isLoading = false;
    }
  }

  // 3. Hier fehlte die Methode, die den Button-Klick verarbeitet
  runQuery() {
    this.error = null;
    this.result = null;
    
    const res = this.dbService.executeQuery(this.query);
    
    if (res.error) {
      this.error = res.error;
    } else {
      this.result = res;
    }
  }
}