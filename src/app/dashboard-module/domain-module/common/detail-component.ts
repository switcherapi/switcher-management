import { DataUtils } from 'src/app/_helpers/data-utils';
import { EnvironmentChangeEvent } from '../environment-config/environment-config.component';
import { EventEmitter } from '@angular/core';
import { Environment } from 'src/app/model/environment';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';

export class DetailComponent {
    childEnvironmentEmitter = new EventEmitter<EnvironmentChangeEvent>();
    detailBodyStyle = 'detail-body loading';
    
    classStatus: string;
    editing: boolean;
    currentStatus: boolean;
    currentEnvironment = 'default';
    environments: Environment[];
    loading: boolean;

    blockuiEnabled = false;
    blockuiMessage: string;

    updatable = false;
    removable = false;
    creatable = false;

    protected selectEnvironment(event: EnvironmentChangeEvent): void {
        this.currentEnvironment = event.environmentName;
        this.currentStatus = event.status;
        this.childEnvironmentEmitter.emit(event);
        
        if (this.editing) {
            this.classStatus = 'header editing';
        } else {
            this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
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
        this.blockuiEnabled = enable;
        this.blockuiMessage = message;
    }

    scrollToElement($element: any): void {
        setTimeout(() => {
          $element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
        }, 500);
    }

    onEnvLoaded(environments: Environment[]): void {
        this.environments = environments;
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