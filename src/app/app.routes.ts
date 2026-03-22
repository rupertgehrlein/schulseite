import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { SqlPlayground } from './pages/sql-playground/sql-playground';
import { MurderMystery } from './pages/murder-mystery/murder-mystery';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'sql-lab', component: SqlPlayground },
  { path: 'murder-mystery', component: MurderMystery }, // <--- NEU
];