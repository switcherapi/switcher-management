import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';

@Injectable()
export class PwaService {
    private readonly swUpdate = inject(SwUpdate);
    private readonly snackbar = inject(MatSnackBar);

    checkForUpdate(): void {
        if (this.swUpdate.isEnabled) {
            this.swUpdate.versionUpdates
            .pipe(
                filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
                map(evt => ({
                    type: 'UPDATE_AVAILABLE',
                    current: evt.currentVersion,
                    available: evt.latestVersion,
                }))
            )
            .subscribe(() => {
                const snack = this.snackbar.open('Update Available', 'Reload');
                snack.onAction().subscribe(() => globalThis.location.reload());
            });
        }
    }
}