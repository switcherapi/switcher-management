import { AdminService } from 'src/app/services/admin.service';

export class DetailComponent {
    detailBodyStyle: string = 'detail-body loading';

    createdBy: string = '';
    classStatus: string;
    editing: boolean;
    currentStatus: boolean;

    updatable: boolean = false;
    removable: boolean = false;
    creatable: boolean = false;

    constructor(private service: AdminService) { }

    loadAdmin(id: string): void {
        this.service.getAdminById(id).subscribe(adm => {
            this.createdBy = adm.name;
        }, () => {
            this.createdBy = '';
        })
    }

    selectEnvironment(status: boolean): void {
        this.currentStatus = status;
    
        if (this.editing) {
          this.classStatus = 'header editing';
        } else {
          this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
        }
    }

    validateEdition(oldObject: any, newObject: any): boolean {
        const fields = Object.keys(oldObject);
        const changed = fields.filter(field => oldObject[`${field}`] != newObject[`${field}`]);
        return !changed.length;
    }

    showResumed(value: string, length: number): string {
        return value.length > length ? `${value.substr(0, length)}...` : value;
    }

}