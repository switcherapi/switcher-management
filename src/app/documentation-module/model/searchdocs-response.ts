export class SearchDocsResponse {
    message: string;
    query: string;
    results: SearchDocsResult[];
}

export class SearchDocsResult {
    file: string;
    segment: string[];
    found: number;
    cache: boolean;
}