import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { environment } from 'src/environments/environment';
import { DefaultOptions } from 'apollo-client';
import { AuthService } from './auth/services/auth.service';

const uri = `${environment.apiUrl}/adm-graphql`;

export function provideApollo(httpLink: HttpLink) {
    const basic = setContext((operation, context) => ({
        headers: {
            Accept: 'charset=utf-8'
        }
    }));

    const token = localStorage.getItem(AuthService.JWT_TOKEN);
    const auth = setContext((operation, context) => ({
        headers: {
            Authorization: `Bearer ${token}`
        },
    }));

    const link = ApolloLink.from([basic, auth, httpLink.create({ uri })]);
    const cache = new InMemoryCache();

    const defaultOptions: DefaultOptions = {
        watchQuery: {
          fetchPolicy: 'no-cache',
          errorPolicy: 'ignore',
        },
        query: {
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        },
    }

    return {
        link,
        cache,
        defaultOptions
    }
}

@NgModule({
    exports: [
        ApolloModule,
        HttpLinkModule
    ],
    providers: [{
        provide: APOLLO_OPTIONS,
        useFactory: provideApollo,
        deps: [HttpLink]
    }]
})
export class GraphQLModule { }