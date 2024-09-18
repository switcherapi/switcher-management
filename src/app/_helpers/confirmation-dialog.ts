import { Input, Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-modal-confirm',
    template: `
      <div class="modal-header">
        <h4 class="modal-title" id="modal-title">{{ title }}</h4>
        <button type="button"class="btn-close" aria-describedby="modal-title" (click)="nok()"> </button>
      </div>
      <div class="modal-body">
        <p><strong>{{ question }}</strong></p>
        <span class="text-danger">This operation can not be undone.</span>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" (click)="nok()">Cancel</button>
        <button type="button" class="btn btn-danger" (click)="ok()">Ok</button>
      </div>
      `
  })
  export class NgbdModalConfirmComponent {
    @Input() title: string;
    @Input() question: string;
  
    constructor(public modal: NgbActiveModal) {}
  
    ok() {
      this.modal.close('ok');
    }
  
    nok() {
      this.modal.close();
    }
    
  }
  