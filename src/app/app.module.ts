import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CalculadoraDeTaxasModule } from './calculadora-de-taxas/calculadora-de-taxas.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, CalculadoraDeTaxasModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
