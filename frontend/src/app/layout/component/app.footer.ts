import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-footer',
    imports: [CommonModule],
    template: `<div class="layout-footer">
        <span>© {{ currentYear }} Invix. Todos os direitos reservados.</span>
    </div>`
})
export class AppFooter {
    currentYear = new Date().getFullYear();
}
