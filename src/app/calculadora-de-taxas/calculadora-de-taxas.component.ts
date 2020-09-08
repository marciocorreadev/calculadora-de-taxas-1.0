/** @format */

import { CalculadoraDeTaxasService } from './calculadora-de-taxas.service';
import { Component, OnInit, OnDestroy, ElementRef, ɵConsole } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { isMobile } from 'is-mobile';
@Component({
  selector: 'app-calculadora-de-taxas',
  templateUrl: './calculadora-de-taxas.component.html',
  styleUrls: ['./calculadora-de-taxas.component.css'],
})
export class CalculadoraDeTaxasComponent implements OnInit, OnDestroy {
  form: FormGroup;
  taxas: any = {};
  bkpTaxas: any = {};
  resultados: any[] = [];
  tabela: string = 'todos';
  validForm: boolean = true;
  tipoTaxaAVista: string = '(1 Dia)';
  visualizacaoDasTaxas: string = 'vendedor';
  width: number = document.querySelector('body').scrollWidth;
  mobile: boolean = isMobile();
  section = this.el.nativeElement.querySelector('section');

  private subscriptions: Subscription[] = [];
  constructor(
    private formBuilder: FormBuilder,
    private taxasService: CalculadoraDeTaxasService,
    private el: ElementRef
  ) {}
  ngOnInit() {
    this.taxas = this.taxasService.getTaxas();

    for (const key in this.taxas) {
      this.bkpTaxas[key] = this.taxas[key];
    }

    this.form = this.formBuilder.group({
      valorTransacao: [0, [Validators.required, Validators.min(0.1)]],
      taxaCreditoAVista: [this.taxas.creditoAVista1D],
      planoRecebimento: ['1D'],
      taxaCreditoParcelado2a6: [this.taxas.creditoParcelado2a61D],
      taxaCreditoParcelado7a12: [this.taxas.creditoParcelado7a121D],
      taxaDebito: [this.taxas.debitoNull],
      taxaParcelamento: [2.99],
      promocao: ['null'],
      visualizacaoDasTaxas: ['vendedor'],
    });

    this.subscriptions.push(
      this.form.get('taxaDebito').valueChanges.subscribe((value) => {
        this.atualizarTxDebito(this.form.get('promocao').value, value);
      })
    );

    this.subscriptions.push(
      this.form.get('taxaCreditoAVista').valueChanges.subscribe((value) => {
        this.atualizarTxCredAVista(this.form.get('planoRecebimento').value, value);
      })
    );

    this.subscriptions.push(
      this.form.get('taxaCreditoParcelado2a6').valueChanges.subscribe((value) => {
        this.atualizarTxCredParcelado2a6(this.form.get('planoRecebimento').value, value);
        // if (this.form.get('taxaCreditoParcelado7a12').value < value) {
        this.form.get('taxaCreditoParcelado7a12').setValue(value);
        // }
      })
    );

    this.subscriptions.push(
      this.form.get('taxaCreditoParcelado7a12').valueChanges.subscribe((value) => {
        this.atualizarTxCredParcelado7a12(this.form.get('planoRecebimento').value, value);
      })
    );

    this.subscriptions.push(
      this.form.get('planoRecebimento').valueChanges.subscribe((value) => {
        const credito = this.obterTxCredito(value);
        this.form.get('taxaCreditoParcelado2a6').setValue(credito.parcelado2a6);
        this.form.get('taxaCreditoParcelado7a12').setValue(credito.parcelado7a12);
        this.atualizarValorCredAVista(credito.aVista);
        this.tipoTaxaAVista = credito.tipoTaxaAVista;
      })
    );

    this.subscriptions.push(
      this.form.get('promocao').valueChanges.subscribe((value) => {
        const credito = this.obterTxCredito(this.form.get('planoRecebimento').value);
        const debito = this.obterTxDebito(value);
        this.form.get('taxaDebito').setValue(debito.taxa);
        this.atualizarValorCredAVista(credito.aVista);
      })
    );

    this.subscriptions.push(
      this.form.get('visualizacaoDasTaxas').valueChanges.subscribe((value) => {
        this.visualizacaoDasTaxas = value;
        setTimeout(() => {
          window.scroll({ top: 700, behavior: 'smooth' });
        }, 300);
      })
    );

    this.form.get('valorTransacao').valueChanges.subscribe((value) => {
      if (value > 0.1) {
        this.form.get('valorTransacao').status == 'VALID'
          ? (this.validForm = true)
          : (this.validForm = false);
      }
    });
  }

  atualizarTxDebito(type: string, value: number) {
    return {
      '0': () => (this.taxas.debito0 = value),
      '199': () => (this.taxas.debito199 = value),

      null: () => (this.taxas.debitoNull = value),
    }[type]();
  }

  atualizarTxCredAVista(type: string, value: number) {
    if (this.form.get('promocao').value != '0') {
      return {
        '1D': () => (this.taxas.creditoAVista1D = value),
        '30D': () => (this.taxas.creditoAVista30D = value),
      }[type]();
    } else {
      this.taxas.creditoAVista0 = value;
    }
  }

  atualizarTxCredParcelado2a6(type: string, value: number) {
    return {
      '1D': () => (this.taxas.creditoParcelado2a61D = value),
      '30D': () => (this.taxas.creditoParcelado2a630D = value),
    }[type]();
  }

  atualizarTxCredParcelado7a12(type: string, value: number) {
    return {
      '1D': () => (this.taxas.creditoParcelado7a121D = value),
      '30D': () => (this.taxas.creditoParcelado7a1230D = value),
    }[type]();
  }

  atualizarValorCredAVista(value: number) {
    this.form.get('promocao').value === '0'
      ? this.form.get('taxaCreditoAVista').setValue(this.taxas.creditoAVista0)
      : this.form.get('taxaCreditoAVista').setValue(value);
  }

  obterTxCredito(type: string) {
    return {
      '1D': {
        parcelado2a6: this.taxas.creditoParcelado2a61D,
        parcelado7a12: this.taxas.creditoParcelado7a121D,
        aVista: this.taxas.creditoAVista1D,
        tipoTaxaAVista: '(1 Dia)',
      },
      '30D': {
        parcelado2a6: this.taxas.creditoParcelado2a630D,
        parcelado7a12: this.taxas.creditoParcelado7a1230D,
        aVista: this.taxas.creditoAVista30D,
        tipoTaxaAVista: '(30 Dias)',
      },
    }[type];
  }

  obterTxDebito(type: string) {
    return {
      '0': { taxa: this.taxas.debito0 },
      '199': { taxa: this.taxas.debito199 },
      null: { taxa: this.taxas.debitoNull },
    }[type];
  }

  validarFormulario() {
    this.form.get('valorTransacao').status == 'VALID'
      ? (this.validForm = true)
      : (this.validForm = false);
  }

  calculaAVista(form, nome) {
    const taxa = nome === 'Déb.' ? form.taxaDebito : form.taxaCreditoAVista;
    const valorTotal = form.valorTransacao;
    let valorTaxaTotal: number = Number((taxa * 100).toFixed(3));
    valorTaxaTotal /= 100;
    const valorVendaDespesaCliente = valorTotal / (1 - valorTaxaTotal / 100);
    let p: any = {};
    p.nome = {
      curto: nome,
      longo: nome === 'Déb.' ? 'Débito' : 'Crédito 1x',
    };
    p.txIntermediacao = nome === 'Déb.' ? 0 : taxa;
    p.qtdeParcelas = 1;
    p.txParcelamento = 0;
    p.txTotal = valorTaxaTotal;
    p.valorVenda = valorTotal;
    p.valorParcelaDespesaVendedor = valorTotal;
    p.valorTxIntermediacaoVendedor = nome === 'Déb.' ? 0 : taxa;
    p.valorTxParcelamentoVendedor = 0;
    p.valorTxDespesaVendedor = (valorTotal * valorTaxaTotal) / 100;
    p.valorTxDebito = nome === 'Déb.' ? valorTaxaTotal : 0;
    p.valorLiquidoDespesaVendedor = valorTotal - p.valorTxDespesaVendedor;
    p.valorVendaDespesaCliente = valorVendaDespesaCliente;
    p.valorParcelaDespesaCliente = valorVendaDespesaCliente;
    p.valorTxIntermediacaoCliente = nome === 'Déb.' ? 0 : taxa;
    p.valorTxParcelamentoCliente = 0;
    p.txDebitoJurosCliente = valorVendaDespesaCliente - valorTotal;
    p.valorTxDespesaCliente = p.txDebitoJurosCliente;
    p.valorLiquidoDespesaClientel = valorTotal;
    p.valorVendaDespesaParcelamentoCliente = valorTotal;
    p.valorParcelaDespesaParcelamentoCliente = valorTotal;
    p.valorLiquidoDespesaIntermediacaoCliente = valorTotal - p.valorTxDespesaVendedor;
    this.resultados.push(p);
  }

  calculaParcelado(form) {
    const valorTotal = form.valorTransacao;
    for (let qtdeParcelas = 2; qtdeParcelas <= 12; qtdeParcelas++) {
      let valorTxParcelamento = this.calcularTxParcelamento(
        valorTotal,
        qtdeParcelas,
        form.taxaParcelamento / 100
      );

      let p: any = {};
      p.nome = {
        curto: `${qtdeParcelas}x`,
        longo: `Crédito ${qtdeParcelas}x`,
      };

      p.qtdeParcelas = qtdeParcelas;
      p.txIntermediacao =
        qtdeParcelas <= 6 ? form.taxaCreditoParcelado2a6 : form.taxaCreditoParcelado7a12;
      p.txParcelamento = 100 * (valorTxParcelamento / valorTotal);
      p.txParcelamento = Number(p.txParcelamento.toFixed(2));
      p.txTotal = p.txIntermediacao + p.txParcelamento;
      p.valorVenda = valorTotal;
      p.valorParcelaDespesaVendedor = valorTotal / qtdeParcelas;
      p.valorTxIntermediacaoVendedor = (valorTotal * p.txIntermediacao) / 100;
      p.valorTxParcelamentoVendedor = (valorTotal * p.txParcelamento) / 100;
      p.valorTxDespesaVendedor = p.valorTxIntermediacaoVendedor + p.valorTxParcelamentoVendedor;
      p.valorLiquidoDespesaVendedor = valorTotal - p.valorTxDespesaVendedor;
      p.valorVendaDespesaCliente = valorTotal / (1 - p.txTotal / 100);
      p.valorParcelaDespesaCliente = p.valorVendaDespesaCliente / qtdeParcelas;
      p.valorTxIntermediacaoCliente = (p.valorVendaDespesaCliente * p.txIntermediacao) / 100;
      p.valorTxParcelamentoCliente = (p.valorVendaDespesaCliente * p.txParcelamento) / 100;
      p.valorTxDespesaCliente = p.valorTxIntermediacaoCliente + p.valorTxParcelamentoCliente;
      p.valorLiquidoDespesaClientel = valorTotal;
      p.valorVendaDespesaParcelamentoCliente = valorTotal + p.valorTxParcelamentoCliente;
      p.valorParcelaDespesaParcelamentoCliente =
        p.valorVendaDespesaParcelamentoCliente / qtdeParcelas;
      p.valorLiquidoDespesaIntermediacaoCliente = valorTotal - p.valorTxIntermediacaoVendedor;
      p.valorTxDebito = 0;
      p.txDebitoJurosCliente = 0;
      this.resultados.push(p);
    }
  }

  calcularTxParcelamento(valorVenda, qtdeParcelas, txParcelamento) {
    let valorTaxaParcelamento = 0;
    let valorParcelamento = valorVenda / qtdeParcelas;
    for (let i = 1; i <= qtdeParcelas; i++) {
      valorTaxaParcelamento =
        valorTaxaParcelamento + valorParcelamento / Math.pow(1 + txParcelamento, i);
      console.log(
        valorParcelamento,
        Math.pow(1 + txParcelamento, i),
        valorParcelamento / Math.pow(1 + txParcelamento, i)
      );
    }
    console.log(
      'Valor Venda:',
      valorVenda,
      'valor Taxa parParcelamento:',
      valorTaxaParcelamento,
      'valor Final',
      valorVenda - valorTaxaParcelamento
    );
    return valorVenda - valorTaxaParcelamento;
  }

  calcular(form) {
    this.validarFormulario();

    if (this.validForm) {
      this.resultados = [];
      this.calculaAVista(form, 'Déb.');
      this.calculaAVista(form, '1x');
      this.calculaParcelado(form);
      setTimeout(() => {
        window.scroll({ top: 700, behavior: 'smooth' });
      }, 300);
    } else {
      this.validarFormulario();
      this.el.nativeElement.querySelector('.valorTransacao').focus();
    }
  }

  limpar() {
    window.scroll({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      for (const key in this.taxas) {
        this.taxas[key] = this.bkpTaxas[key];
      }
      this.form.setValue({
        valorTransacao: 0,
        taxaCreditoAVista: this.taxas.creditoAVista1D,
        planoRecebimento: '1D',
        taxaCreditoParcelado2a6: this.taxas.creditoParcelado2a61D,
        taxaCreditoParcelado7a12: this.taxas.creditoParcelado7a121D,
        taxaDebito: this.taxas.debitoNull,
        taxaParcelamento: 2.99,
        promocao: 'null',
        visualizacaoDasTaxas: 'vendedor',
      });
      this.resultados = [];
      this.validForm = true;
    }, 300);
    this.el.nativeElement.querySelector('.valorTransacao').focus();
  }

  getWidth() {
    this.width = document.querySelector('body').scrollWidth;
    this.mobile = isMobile();
  }

  removerTooltip() {
    if (document.querySelector('bs-tooltip-container')) {
      document.querySelector('bs-tooltip-container').classList.remove('show');
    }
  }

  addTooltip() {
    if (document.querySelector('bs-tooltip-container')) {
      document.querySelector('bs-tooltip-container').classList.add('show');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
