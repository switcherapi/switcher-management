import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, signal } from '@angular/core';
import { MatChipInputEvent, MatChipGrid, MatChipRow, MatChipRemove, MatChipInput } from '@angular/material/chips';
import { Settings, Slack } from 'src/app/model/slack';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-slack-settings',
    templateUrl: './slack-settings.component.html',
    styleUrls: [
        '../../common/css/detail.component.css'
    ],
    imports: [MatFormField, MatLabel, MatChipGrid, MatChipRow, MatChipRemove, MatIcon, MatChipInput]
})
export class SlackSettingsComponent {

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly ignoredEnvironments = signal<string[]>([]);
  readonly frozenEnvironments = signal<string[]>([]);
  readonly settings = signal<Settings | null>(null);
  readonly updatable = signal(false);

  loadSettings(slack: Slack): void {
    this.settings.set({ ...slack.settings });
    this.ignoredEnvironments.set([...slack.settings.ignored_environments]);
    this.frozenEnvironments.set([...slack.settings.frozen_environments]);
  }

  updateSettings(settings: Settings) {
    this.settings.update(current => current ? {
      ...current,
      ignored_environments: [...settings.ignored_environments],
      frozen_environments: [...settings.frozen_environments]
    } : null);
  }

  add(event: MatChipInputEvent, list: string): void {
    const value = (event.value || '').trim();
    if (value) {
      if (list === 'ignored') {
        this.ignoredEnvironments.update(envs => [...envs, value]);
      } else if (list === 'frozen') {
        this.frozenEnvironments.update(envs => [...envs, value]);
      }
    }

    event.chipInput.clear();
  }

  remove(env: string, list: string): void {
    if (list === 'ignored') {
      this.ignoredEnvironments.update(envs => envs.filter(e => e !== env));
    } else if (list === 'frozen') {
      this.frozenEnvironments.update(envs => envs.filter(e => e !== env));
    }
  }

}
