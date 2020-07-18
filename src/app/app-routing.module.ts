import { CalculadoraDeTaxasComponent } from './calculadora-de-taxas/calculadora-de-taxas.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'calculadora',
    component: CalculadoraDeTaxasComponent,
  },
  { path: '', pathMatch: 'full', redirectTo: 'calculadora' },
  { path: '**', component: CalculadoraDeTaxasComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
