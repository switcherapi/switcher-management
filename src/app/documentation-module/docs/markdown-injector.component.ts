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
      const darkPrefix = document.documentElement.classList.contains("dark-mode") ? '_dark' : '';

      if (data)
        this.markdown = data.replace(/\[\$ASSETS_LOCATION\]/g, environment.docsUrl).replace(/\[\$DARK_SUFFIX\]/g, darkPrefix);
      else
        this.markdown = `${environment.docsUrl}${this.documentToRender} not found`;
    });
    
    document.documentElement.addEventListener('dark-mode', () => {
      this.init();
    });
  }

}
