import { signal } from '@angular/core';

export class BasicComponent {
    blockuiEnabled = signal(false);
    blockuiMessage = signal('Loading...');

    protected setBlockUI(enable: boolean, message = 'Loading...'): void {
        this.blockuiEnabled.set(enable);
        this.blockuiMessage.set(message);
    }
}