import { AdminService } from '../../services/admin.service';

export class DetailComponent {
    createdBy: string;

    constructor(
        private service: AdminService,
      ) { }

    loadAdmin(id: string): void {
        this.service.getAdminById(id).subscribe(adm => {
            this.createdBy = adm.name;
        })
    }

}