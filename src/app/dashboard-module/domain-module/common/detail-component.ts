import { DataUtils } from 'src/app/_helpers/data-utils';
import { EnvironmentChangeEvent } from '../environment-config/environment-config.component';
import { EventEmitter, signal } from '@angular/core';
import { Environment } from 'src/app/model/environment';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';

export class DetailComponent {
    childEnvironmentEmitter = new EventEmitter<EnvironmentChangeEvent>();
    detailBodyStyle = signal('detail-body loading');
    
    classStatus = signal('');
    editing = signal(false);
    currentStatus = signal(false);
    currentEnvironment = signal('default');
    environments = signal<Environment[]>([]);
    loading = signal(false);

    blockuiEnabled = signal(false);
    blockuiMessage = signal('');

    updatable = signal(false);
    removable = signal(false);
    creatable = signal(false);

    protected selectEnvironment(event: EnvironmentChangeEvent): void {
        this.currentEnvironment.set(event.environmentName);
        this.currentStatus.set(event.status);
        this.childEnvironmentEmitter.emit(event);
        
        if (this.editing()) {
            this.classStatus.set('header editing');
        } else {
            this.classStatus.set(this.currentStatus() ? 'header activated' : 'header deactivated');
        }
    }

    protected validateEdition(oldObject: any, newObject: any): boolean {
        const fields = Object.keys(oldObject);
        const changed = fields.filter(field => !Object.is(oldObject[`${field}`], newObject[`${field}`]));
        return !changed.length;
    }

    protected showResumed(value: string, length: number): string {
        return DataUtils.showResumed(value, length);
    }

    protected setBlockUI(enable: boolean, message?: string): void {
        this.blockuiEnabled.set(enable);
        this.blockuiMessage.set(message || '');
    }

    scrollToElement($element: any): void {
        setTimeout(() => {
          $element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
        }, 500);
    }

    onEnvLoaded(environments: Environment[]): void {
        this.environments.set(environments);
    }

    onEnvChange($event: EnvironmentChangeEvent) {
        this.selectEnvironment($event);
    }

    onEnvStatusChanged($event: EnvironmentChangeEvent) {
        this.updateEnvironmentStatus($event);
    }

    onEnvRemoved($event: any) {
        this.removeEnvironmentStatus($event);
    }

    updateEnvironmentStatus(env: EnvironmentChangeEvent): void {
        ConsoleLogger.printError('Method not implemented. Event: ' + JSON.stringify(env));
    }

    removeEnvironmentStatus(env: any): void {
        ConsoleLogger.printError('Method not implemented. Event: ' + JSON.stringify(env));
    }

}