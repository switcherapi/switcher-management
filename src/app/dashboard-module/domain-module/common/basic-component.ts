import { ChangeDetectorRef, inject } from "@angular/core";

export class BasicComponent {
    private readonly cdr = inject(ChangeDetectorRef, { optional: true });
    
    blockuiEnabled = false;
    blockuiMessage = 'Loading...';

    protected setBlockUI(enable: boolean, message = 'Loading...'): void {
        this.blockuiEnabled = enable;
        this.blockuiMessage = message;
        this.cdr?.detectChanges();
    }
}