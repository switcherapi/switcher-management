import { environment } from 'src/environments/environment';
import { MarkdownService } from 'ngx-markdown';
import { Injectable, OnInit } from '@angular/core';
import { Inject } from '@angular/core';

@Injectable()
export abstract class MarkdownInjector implements OnInit {

  markdown: string;

  constructor(protected markdownService: MarkdownService,
    @Inject(String) protected documentToRender: String) { }

  ngOnInit(): void {
    this.markdownService.getSource(`${environment.docsUrl}${this.documentToRender}`).subscribe(data => {
      if (data)
        this.markdown = data.replace(/\[\$ASSETS_LOCATION\]/g, environment.docsUrl);
      else
        this.markdown = `${environment.docsUrl}${this.documentToRender} not found`;
    });
  }

}
