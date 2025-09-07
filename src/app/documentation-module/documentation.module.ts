import { NgModule, SecurityContext } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { DocumentationRoutingModule } from './documentation.routing';

@NgModule({
    imports: [
        DocumentationRoutingModule,
        MarkdownModule.forRoot({
            sanitize: SecurityContext.NONE
        }),
        MarkdownModule.forChild()
    ]
})
export class DocumentationModuleModule { }
