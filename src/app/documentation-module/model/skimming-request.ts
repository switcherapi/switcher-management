import { url, files } from "./skimming-context";

export class SkimmingRequest {
    query: string;
    url: string = url;
    files: string = files;
    ignoreCase?: boolean = true;
    trimContent?: boolean = true;
    previewLength: number = 200
}