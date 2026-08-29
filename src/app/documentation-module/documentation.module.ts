import { NgModule, SecurityContext } from '@angular/core';
import { provideMarkdown, SANITIZE } from 'ngx-markdown';
import { DocumentationRoutingModule } from './documentation.routing';

@NgModule({
    imports: [
        DocumentationRoutingModule
    ],
    providers: [
        provideMarkdown({
            sanitize: {
                provide: SANITIZE,
                useValue: SecurityContext.NONE
            },
        })
    ]
})
export class DocumentationModuleModule { }
