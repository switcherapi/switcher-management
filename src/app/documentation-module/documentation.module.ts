import { NgModule, SecurityContext } from '@angular/core';
import { MarkdownModule, SANITIZE } from 'ngx-markdown';
import { DocumentationRoutingModule } from './documentation.routing';

@NgModule({
    imports: [
        DocumentationRoutingModule,
        MarkdownModule.forRoot({
        sanitize: {
            provide: SANITIZE,
            useValue: SecurityContext.NONE
        },
        }),
        MarkdownModule.forChild()
    ]
})
export class DocumentationModuleModule { }
