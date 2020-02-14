import { AdminService } from '../../services/admin.service';

export class DetailComponent {
    createdBy: string = '';
    classStatus: string;
    editing: boolean;
    currentStatus: boolean;

    updatable: boolean = true;
    removable: boolean = true;

    constructor(
        private service: AdminService,
      ) { }

    loadAdmin(id: string): void {
        this.service.getAdminById(id).subscribe(adm => {
            this.createdBy = adm.name;
        })
    }

}