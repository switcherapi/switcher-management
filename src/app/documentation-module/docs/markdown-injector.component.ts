import { environment } from 'src/environments/environment';
import { MarkdownService } from 'ngx-markdown';
import { Injectable, inject } from '@angular/core';

@Injectable()
export abstract class MarkdownInjector {

  private readonly markdownService = inject(MarkdownService);
  markdown: string;

  protected init(documentToRender: string): void {
    this.markdownService.getSource(`${environment.docsUrl}${documentToRender}`).subscribe(data => {
      const darkPrefix = document.documentElement.classList.contains("dark-mode") ? '_dark' : '';

      if (data)
        this.markdown = data.replace(/\[\$ASSETS_LOCATION\]/g, environment.docsUrl).replace(/\[\$DARK_SUFFIX\]/g, darkPrefix);
      else
        this.markdown = `${environment.docsUrl}${documentToRender} not found`;
    });
    
    document.documentElement.addEventListener('dark-mode', () => {
      this.init(documentToRender);
    });
  }

}
