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
        })
    }

    validateEdition(oldObject: any, newObject: any): boolean {
        const fields = Object.keys(oldObject);
        const changed = fields.filter(field => oldObject[`${field}`] != newObject[`${field}`]);
        return !changed.length;
    }

}