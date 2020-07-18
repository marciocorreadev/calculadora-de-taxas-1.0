import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculadoraDeTaxasService } from './calculadora-de-taxas.service';
import localePt from '@angular/common/locales/pt';
import { NgxCurrencyModule } from 'ngx-currency';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { registerLocaleData } from '@angular/common';
import { CalculadoraDeTaxasComponent } from './calculadora-de-taxas.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

registerLocaleData(localePt, 'pt-BR');

export const customCurrencyMaskConfig = {
  align: 'left',
  allowNegative: false,
  allowZero: false,
  decimal: ',',
  precision: 2,
  prefix: 'R$ ',
  suffix: '',
  thousands: '.',
  nullable: false,
};

@NgModule({
  declarations: [CalculadoraDeTaxasComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
    TooltipModule.forRoot(),
  ],
  providers: [CalculadoraDeTaxasService, { provide: LOCALE_ID, useValue: 'pt-BR' }],
})
export class CalculadoraDeTaxasModule {}
