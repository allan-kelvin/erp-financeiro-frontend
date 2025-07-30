import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Input() title: string = 'Dashboard'; // Input para o título da página

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    // Escuta eventos de navegação para atualizar o título dinamicamente
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Lógica para obter o título da rota ativa
      let currentRoute = this.router.routerState.snapshot.root;
      let title = 'Dashboard'; // Título padrão

      while (currentRoute.children.length > 0) {
        currentRoute = currentRoute.children[0];
        if (currentRoute.data['title']) {
          title = currentRoute.data['title'];
        }
      }
      this.title = title;
    });
  }

  /**
   * Realiza o logout do usuário e redireciona para a tela de login.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
