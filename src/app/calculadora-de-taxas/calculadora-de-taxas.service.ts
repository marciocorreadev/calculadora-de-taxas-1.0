import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CalculadoraDeTaxasService {
  taxas: any = {
    creditoParceladoNaHora: 5.59,
    creditoParcelado14D: 4.59,
    creditoParcelado30D: 3.79,
    creditoParcelado30DT: 4.19,
    creditoAVistaNaHora: 4.99,
    creditoAVista14D: 3.99,
    creditoAVista30D: 3.19,
    creditoAVista30DT: 3.59,
    creditoAVista0: 0,
    debito0: 0,
    debito199: 1.99,
    debitoNull: 2.39,
  };
  constructor() {}

  getTaxas() {
    return this.taxas;
  }
}
