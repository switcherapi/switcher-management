import { environment } from 'src/environments/environment';
import { MarkdownService } from 'ngx-markdown';
import { Injectable, inject, signal } from '@angular/core';

@Injectable()
export abstract class MarkdownInjector {

  private readonly markdownService = inject(MarkdownService);
  readonly markdown = signal<string>('');

  protected init(documentToRender: string): void {
    this.markdownService.getSource(`${environment.docsUrl}${documentToRender}`).subscribe(data => {
      const darkPrefix = document.documentElement.classList.contains("dark-mode") ? '_dark' : '';
      
      const processedMarkdown = data ? 
        data.replaceAll('[$ASSETS_LOCATION]', environment.docsUrl).replaceAll('[$DARK_SUFFIX]', darkPrefix) : 
        `${environment.docsUrl}${documentToRender} not found`;
      
      this.markdown.set(processedMarkdown);
    });
    
    document.documentElement.addEventListener('dark-mode', () => {
      this.init(documentToRender);
    });
  }

}
