import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';

@Injectable()
export class PwaService {
    constructor(private swUpdate: SwUpdate, 
        private snackbar: MatSnackBar) {
    }

    checkForUpdate(): void {
        if (this.swUpdate.isEnabled) {
            this.swUpdate.available.subscribe(() => {
                const snack = this.snackbar.open('Update Available', 'Reload');
                snack.onAction().subscribe(() => window.location.reload());
                snack._dismissAfter(10000);
            });
        }
    }
}