import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { environment } from 'src/environments/environment';
import { inject, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

const uri = `${environment.apiUrl}/adm-graphql`;

export function createApollo(): ApolloClientOptions<any> {
  const httpLink = inject(HttpLink);

  return {
    link: httpLink.create({ uri }),
    cache: new InMemoryCache(),
  };
}

@NgModule({
  imports: [BrowserModule],
  providers: [provideApollo(createApollo)]
})
export class GraphQLModule { }