export class SearchDocsRequest {
    query: string;
    ignoreCase?: boolean = true;
    trimContent?: boolean = true;
    previewLength = 200
}