export class BasicComponent {
    blockuiEnabled = false;
    blockuiMessage = 'Loading...';

    protected setBlockUI(enable: boolean, message = 'Loading...'): void {
        this.blockuiEnabled = enable;
        this.blockuiMessage = message;
    }
}