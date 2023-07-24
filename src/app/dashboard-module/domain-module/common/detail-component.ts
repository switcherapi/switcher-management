import { E } from '@angular/cdk/keycodes';
import { AdminService } from 'src/app/services/admin.service';
import { DataUtils } from 'src/app/_helpers/data-utils';
import { EnvironmentChangeEvent } from '../environment-config/environment-config.component';
import { EventEmitter } from '@angular/core';

export class DetailComponent {
    childEnvironmentEmitter: EventEmitter<EnvironmentChangeEvent> = new EventEmitter();
    detailBodyStyle: string = 'detail-body loading';

    createdBy: string = '';
    classStatus: string;
    editing: boolean;
    currentStatus: boolean;
    currentEnvironment: string = 'default';
    loading: boolean;

    updatable: boolean = false;
    removable: boolean = false;
    creatable: boolean = false;

    constructor(private service: AdminService) { }

    loadAdmin(id: string): void {
        this.service.getAdminById(id).subscribe(adm => {
            this.createdBy = adm.name;
        }, () => this.createdBy = '')
    }

    selectEnvironment(event: EnvironmentChangeEvent): void {
        this.currentEnvironment = event.environmentName;
        this.currentStatus = event.status;
        this.childEnvironmentEmitter.emit(event);
        
        if (this.editing) {
            this.classStatus = 'header editing';
        } else {
            this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
        }
    }

    validateEdition(oldObject: any, newObject: any): boolean {
        const fields = Object.keys(oldObject);
        const changed = fields.filter(field => !Object.is(oldObject[`${field}`], newObject[`${field}`]));
        return !changed.length;
    }

    showResumed(value: string, length: number): string {
        return  DataUtils.showResumed(value, length);
    }

    scrollToElement($element: any): void {
        setTimeout(() => {
          $element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
        }, 500);
    }

}