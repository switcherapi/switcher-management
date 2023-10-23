import { DataUtils } from 'src/app/_helpers/data-utils';
import { EnvironmentChangeEvent } from '../environment-config/environment-config.component';
import { EventEmitter } from '@angular/core';
import { Environment } from 'src/app/model/environment';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';

export class DetailComponent {
    childEnvironmentEmitter: EventEmitter<EnvironmentChangeEvent> = new EventEmitter();
    detailBodyStyle: string = 'detail-body loading';
    
    classStatus: string;
    editing: boolean;
    currentStatus: boolean;
    currentEnvironment: string = 'default';
    environments: Environment[];
    loading: boolean;

    updatable: boolean = false;
    removable: boolean = false;
    creatable: boolean = false;

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
        return  DataUtils.showResumed(value, length);
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
        ConsoleLogger.printError('Method not implemented.');
    }

    removeEnvironmentStatus(env: any): void {
        ConsoleLogger.printError('Method not implemented.');
    }

}