import { environment } from 'src/environments/environment';
import { MarkdownService } from 'ngx-markdown';
import { Injectable, Inject } from '@angular/core';

@Injectable()
export abstract class MarkdownInjector {

  markdown: string;

  constructor(protected markdownService: MarkdownService,
    @Inject(String) protected documentToRender: string) {
    this.init();
  }

  init(): void {
    this.markdownService.getSource(`${environment.docsUrl}${this.documentToRender}`).subscribe(data => {
      if (data)
        this.markdown = data.replace(/\[\$ASSETS_LOCATION\]/g, environment.docsUrl);
      else
        this.markdown = `${environment.docsUrl}${this.documentToRender} not found`;
    });
  }

}
