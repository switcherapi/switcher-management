import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
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
  ignoredEnvironments: string[] = [];
  frozenEnvironments: string[] = [];
  settings: Settings;
  updatable = false;

  loadSettings(slack: Slack): void {
    this.settings = { ...slack.settings };
    this.ignoredEnvironments = Object.assign([], slack.settings.ignored_environments);
    this.frozenEnvironments = Object.assign([], slack.settings.frozen_environments);
  }

  updateSettings(settings: Settings) {
    this.settings.ignored_environments = Object.assign([], settings.ignored_environments);
    this.settings.frozen_environments = Object.assign([], settings.frozen_environments);
  }

  add(event: MatChipInputEvent, list: string): void {
    const value = (event.value || '').trim();
    if (value) {
      if (list === 'ignored')
        this.ignoredEnvironments.push(value);
      else if (list === 'frozen')
        this.frozenEnvironments.push(value);
    }

    event.chipInput.clear();
  }

  remove(env: string, list: string): void {
    if (list === 'ignored') {
      const index = this.ignoredEnvironments.indexOf(env);
      this.ignoredEnvironments.splice(index, 1);
    } else if (list === 'frozen') {
      const index = this.frozenEnvironments.indexOf(env);
      this.frozenEnvironments.splice(index, 1);
    }
  }

}
