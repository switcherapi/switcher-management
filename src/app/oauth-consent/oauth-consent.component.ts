import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { OAuthService } from '../services/oauth.service';

interface OAuthConsentQueryParams {
  response_type: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
  state: string;
  code_challenge: string;
  code_challenge_method: string;
}

interface OAuthScopeDetail {
  value: string;
  description: string;
}

@Component({
    selector: 'app-oauth-consent',
    templateUrl: './oauth-consent.component.html',
    styleUrls: ['./oauth-consent.component.css'],
    imports: [MatFormField, MatLabel, MatInput, MatButton, MatIcon]
})
export class OauthConsentComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly oauthService = inject(OAuthService);

  // Future enhancement: expose client metadata from switcher-api so this screen can render a friendly app name.
  private readonly scopeDescriptions: Record<string, string> = {
    'config:read': 'Read your feature flag settings'
  };

  readonly request = signal<OAuthConsentQueryParams>({
    response_type: '',
    client_id: '',
    redirect_uri: '',
    scope: '',
    state: '',
    code_challenge: '',
    code_challenge_method: ''
  });

  readonly loading = signal(true);
  readonly error = signal('');

  readonly scopes = computed<OAuthScopeDetail[]>(() => {
    const scopeValue = this.request().scope;

    if (!scopeValue?.trim()) {
      return [];
    }

    return scopeValue
      .split(' ')
      .map(scope => scope.trim())
      .filter(scope => !!scope)
      .map(scope => ({
        value: scope,
        description: this.scopeDescriptions[scope] ?? 'Access your Switcher API account using the requested permissions'
      }));
  });

  readonly clientIdPreview = computed(() => {
    const clientId = this.request().client_id;

    if (!clientId) {
      return '';
    }

    return clientId.length > 8 ? `${clientId.slice(0, 8)}...` : clientId;
  });

  readonly scopeSummary = computed(() => {
    const scopes = this.scopes();

    if (!scopes.length) {
      return 'No scopes requested';
    }

    return scopes.map(scope => scope.value).join(', ');
  });

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const request = {
        response_type: params['response_type'] ?? '',
        client_id: params['client_id'] ?? '',
        redirect_uri: params['redirect_uri'] ?? '',
        scope: params['scope'] ?? '',
        state: params['state'] ?? '',
        code_challenge: params['code_challenge'] ?? '',
        code_challenge_method: params['code_challenge_method'] ?? ''
      };

      this.request.set(request);
      this.error.set(this.validate(request));
      this.loading.set(false);
    });
  }

  onAuthorize(): void {
    this.submitConsent(true);
  }

  onDecline(): void {
    this.submitConsent(false);
  }

  private submitConsent(consent: boolean): void {
    if (this.error()) {
      return;
    }

    this.loading.set(true);
    this.oauthService.authorize({ ...this.request() }, consent)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          window.location.href = response.redirect_uri;
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Unable to complete the authorization request. Please try again.');
        }
      });
  }

  private validate(request: OAuthConsentQueryParams): string {
    if (!request.client_id || !request.redirect_uri || !request.code_challenge) {
      return 'Unable to load OAuth authorization from the given URL';
    }

    try {
      new URL(request.redirect_uri);
    } catch {
      return 'Unable to load OAuth authorization from the given URL';
    }

    if (request.response_type && request.response_type !== 'code') {
      return 'Only the authorization code flow is supported';
    }

    if (request.code_challenge_method && request.code_challenge_method !== 'S256') {
      return 'Only the S256 code challenge method is supported';
    }

    return '';
  }
}
