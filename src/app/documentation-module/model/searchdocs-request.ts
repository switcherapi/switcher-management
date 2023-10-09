export class SearchDocsRequest {
    query: string;
    ignoreCase?: boolean = true;
    trimContent?: boolean = true;
    previewLength: number = 200
}