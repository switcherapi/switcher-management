import { environment } from 'src/environments/environment';
import { MarkdownService } from 'ngx-markdown';
import { OnInit } from '@angular/core';

export class MarkdownInjector implements OnInit {

  markdown: string;

  constructor(private markdownService: MarkdownService,
    private documentToRender: string) { }

  ngOnInit(): void {
    this.markdownService.getSource(`${environment.docsUrl}${this.documentToRender}`).subscribe(data => {
      if (data)
        this.markdown = data.replace(/\[\$ASSETS_LOCATION\]/g, environment.docsUrl);
      else
        this.markdown = `${environment.docsUrl}${this.documentToRender} not found`;
    });
  }

}
