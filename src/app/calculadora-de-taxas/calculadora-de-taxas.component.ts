import { CalculadoraDeTaxasService } from './calculadora-de-taxas.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
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
  validForm: boolean = false;

  private subscriptions: Subscription[] = [];
  constructor(private formBuilder: FormBuilder, private taxasService: CalculadoraDeTaxasService) {}
  ngOnInit() {
    this.taxas = this.taxasService.getTaxas();
    for (const key in this.taxas) {
      this.bkpTaxas[key] = this.taxas[key];
    }
    this.form = this.formBuilder.group({
      valorTransacao: [100, [Validators.required, Validators.min(0.1)]],
      taxaCreditoAVista: [0],
      planoRecebimento: ['30D'],
      taxaCreditoParcelado: [this.taxas.creditoParcelado30D],
      taxaDebito: [0],
      taxaParcelamento: [2.99],
      promocao: ['0'],
      tabela: ['todos'],
    });
    this.subscriptions.push(
      this.form.get('taxaDebito').valueChanges.subscribe(value => {
        this.atualizarTxDebito(this.form.get('promocao').value, value);
      })
    );
    this.subscriptions.push(
      this.form.get('taxaCreditoAVista').valueChanges.subscribe(value => {
        this.atualizarTxCredAVista(this.form.get('planoRecebimento').value, value);
      })
    );
    this.subscriptions.push(
      this.form.get('taxaCreditoParcelado').valueChanges.subscribe(value => {
        this.atualizarTxCredParcelado(this.form.get('planoRecebimento').value, value);
      })
    );
    this.subscriptions.push(
      this.form.get('planoRecebimento').valueChanges.subscribe(value => {
        const credito = this.obterTxCredito(this.form.get('planoRecebimento').value);
        this.form.get('taxaCreditoParcelado').setValue(credito.parcelado);
        this.atualizarValorCredAVista(credito.aVista);
      })
    );
    this.subscriptions.push(
      this.form.get('promocao').valueChanges.subscribe(value => {
        const credito = this.obterTxCredito(this.form.get('planoRecebimento').value);
        const debito = this.obterTxDebito(value);
        this.form.get('taxaDebito').setValue(debito.taxa);
        this.atualizarValorCredAVista(credito.aVista);
      })
    );
  }
  atualizarTxDebito(type: string, value: number) {
    return {
      '0': () => this.atualizarDebitoCredito(value),
      '199': () => (this.taxas.debito199 = value),
      'null': () => (this.taxas.debitoNull = value),
    }[type]();
  }
  atualizarTxCredAVista(type: string, value: number) {
    if (this.form.get('promocao').value != '0') {
      return {
        'naHora': () => (this.taxas.creditoAVistaNaHora = value),
        '14D': () => (this.taxas.creditoAVista14D = value),
        '30D': () => (this.taxas.creditoAVista30D = value),
        '30DT': () => (this.taxas.creditoAVista30DT = value),
      }[type]();
    } else {
      this.atualizarDebitoCredito(value);
    }
  }
  atualizarDebitoCredito(value) {
    this.taxas.creditoAVista0 = value;
    this.taxas.debito0 = value;
    this.form.get('taxaDebito').setValue(value, { emitEvent: false });
    this.form.get('taxaCreditoAVista').setValue(value, { emitEvent: false });
  }
  atualizarTxCredParcelado(type: string, value: number) {
    return {
      'naHora': () => (this.taxas.creditoParceladoNaHora = value),
      '14D': () => (this.taxas.creditoParcelado14D = value),
      '30D': () => (this.taxas.creditoParcelado30D = value),
      '30DT': () => (this.taxas.creditoParcelado30DT = value),
    }[type]();
  }
  atualizarValorCredAVista(value: number) {
    this.form.get('promocao').value === '0'
      ? this.form.get('taxaCreditoAVista').setValue(this.taxas.creditoAVista0)
      : this.form.get('taxaCreditoAVista').setValue(value);
  }
  obterTxCredito(type: string) {
    return {
      'naHora': {
        parcelado: this.taxas.creditoParceladoNaHora,
        aVista: this.taxas.creditoAVistaNaHora,
      },
      '14D': {
        parcelado: this.taxas.creditoParcelado14D,
        aVista: this.taxas.creditoAVista14D,
      },
      '30D': {
        parcelado: this.taxas.creditoParcelado30D,
        aVista: this.taxas.creditoAVista30D,
      },
      '30DT': {
        parcelado: this.taxas.creditoParcelado30DT,
        aVista: this.taxas.creditoAVista30DT,
      },
    }[type];
  }
  obterTxDebito(type: string) {
    return {
      '0': { taxa: this.taxas.debito0 },
      '199': { taxa: this.taxas.debito199 },
      'null': { taxa: this.taxas.debitoNull },
    }[type];
  }

  validarFormulario() {
    this.validForm = this.form.controls['valorTransacao'].touched;
  }
  limpar() {
    for (const key in this.taxas) {
      this.taxas[key] = this.bkpTaxas[key];
    }
    this.form.setValue({
      valorTransacao: 0,
      taxaCreditoAVista: 0,
      planoRecebimento: '30D',
      taxaCreditoParcelado: this.taxas.creditoParcelado30D,
      taxaDebito: 0,
      taxaParcelamento: 2.99,
      promocao: '0',
      tabela: 'todos',
    });
    this.resultados = [];
    this.validForm = false;
  }
  calculaAVista(form, nome) {
    const taxa = nome === 'Débito' ? form.taxaDebito : form.taxaCreditoAVista;
    const valorTotal = form.valorTransacao;
    let valorTaxaTotal: number = Number((taxa * 100).toFixed(3));
    valorTaxaTotal /= 100;
    const valorVendaDespesaCliente = valorTotal / (1 - valorTaxaTotal / 100);
    let p: any = {};
    p.nome = nome;
    p.txIntermediacao = nome === 'Débito' ? 0 : taxa;
    p.txParcelamento = 0;
    p.txTotal = valorTaxaTotal;
    p.valorVenda = valorTotal;
    p.valorParcelaDespesaVendedor = valorTotal;
    p.valorTxIntermediacaoVendedor = nome === 'Débito' ? 0 : taxa;
    p.valorTxParcelamentoVendedor = 0;
    p.valorTxDespesaVendedor = (valorTotal * valorTaxaTotal) / 100;
    p.valorTxDebito = nome === 'Débito' ? valorTaxaTotal : 0;
    p.valorLiquidoDespesaVendedor = valorTotal - p.valorTxDespesaVendedor;
    p.valorVendaDespesaCliente = valorVendaDespesaCliente;
    p.valorParcelaDespesaCliente = valorVendaDespesaCliente;
    p.valorTxIntermediacaoCliente = nome === 'Débito' ? 0 : taxa;
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
      let valorTxParcelamento = this.calcularTxParcelamento(valorTotal, qtdeParcelas, form.taxaParcelamento / 100);
      let p: any = {};
      p.nome = `Crédito ${qtdeParcelas}x`;
      p.txIntermediacao = form.taxaCreditoParcelado;
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
      p.valorParcelaDespesaParcelamentoCliente = p.valorVendaDespesaParcelamentoCliente / qtdeParcelas;
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
      valorTaxaParcelamento = valorTaxaParcelamento + valorParcelamento / Math.pow(1 + txParcelamento, i);
    }
    return valorVenda - valorTaxaParcelamento;
  }
  calcular(form) {
    this.tabela = form.tabela;
    this.resultados = [];
    this.calculaAVista(form, 'Débito');
    this.calculaAVista(form, 'Credito 1x');
    this.calculaParcelado(form);
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
