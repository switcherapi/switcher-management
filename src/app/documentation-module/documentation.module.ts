import { NgModule, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { DocumentationRoutingModule } from './documentation.routing';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [
        CommonModule,
        DocumentationRoutingModule,
        MatIconModule,
        MarkdownModule.forRoot({
            sanitize: SecurityContext.NONE
        }),
        MarkdownModule.forChild()
    ]
})
export class DocumentationModuleModule { }
