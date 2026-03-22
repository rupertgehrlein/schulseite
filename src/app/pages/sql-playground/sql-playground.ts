import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sql-playground',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Wichtig für ngModel
  templateUrl: './sql-playground.html',
})
export class SqlPlayground implements OnInit {
  query: string = 'SELECT * FROM Song;';
  result: any = null;
  error: string | null = null;
  isLoading = true;

  constructor(private dbService: DatabaseService) {}

  async ngOnInit() {
  try {
    await this.dbService.initDatabase('spotify'); 
      this.runQuery();
  } catch (e: any) {
    console.error("Datenbank-Fehler:", e);
    this.error = `Kritischer Fehler: Die Datenbank konnte nicht geladen werden. (${e.message || e})`;
  } finally {
    // Egal ob Erfolg oder Fehler: Lade-Spinner beenden
    this.isLoading = false;
  }
}

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