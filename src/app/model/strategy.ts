export class Strategy {
    id: string;
    description: string;
    strategy: string;
    operation: string;
    createdAt: Date;
    updatedAt: Date;
    activated: Map<string, boolean>;
    owner: string;
    config: string;
    values: string[];
}