import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router'; // Para navegação

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    trigger('slideDownUp', [
      state('open', style({
        height: '*',
        opacity: 1,
        visibility: 'visible',
        'padding-top': '0.5rem'
      })),
      state('closed', style({
        height: '0',
        opacity: 0,
        visibility: 'hidden',
        'padding-top': '0'
      })),
      transition('open <=> closed', [
        animate('0.3s ease-in-out')
      ])
    ])
  ]
})
export class SidebarComponent {

  isCadastrosExpanded: boolean = false;
  isFinanceiroExpanded: boolean = false;
  isLancamentosExpanded: boolean = false;

  constructor() { }

  toggleSubMenu(menu: string): void {
    switch (menu) {
      case 'cadastros':
        this.isCadastrosExpanded = !this.isCadastrosExpanded;
        this.isFinanceiroExpanded = false;
        this.isLancamentosExpanded = false;
        break;
      case 'financeiro':
        this.isFinanceiroExpanded = !this.isFinanceiroExpanded;
        this.isCadastrosExpanded = false;
        this.isLancamentosExpanded = false;
        break;
      case 'lancamentos':
        this.isLancamentosExpanded = !this.isLancamentosExpanded;
        this.isCadastrosExpanded = false;
        this.isFinanceiroExpanded = false;
        break;
    }
  }
}
