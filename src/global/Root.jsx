import React from 'react';
import {
  NavLink,
  Link,
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink } from 'apollo-link'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'
import { onError } from 'apollo-link-error'


import Auth from '../auth/auth'

import FeedPage from '../components/FeedPage'
import DraftsPage from '../components/DraftsPage'
import CreatePage from '../components/CreatePage'
import DetailPage from '../components/DetailPage'
import Callback from '../components/Callback'

import StripeExpressRegistrationPage from '../components/StripeExpress'
import StripeRegistrationPage from '../components/Stripe'
import 'tachyons'
import '../index.css'

const httpLink = new HttpLink({ uri: 'http://localhost:4000' })


const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('access_token')
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : ``
    }
  }
})

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) graphQLErrors.map(({ message }) => console.log(message))
})

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})


const auth = new Auth((result) => console.log('auth result', result), client)

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication()
  }
}

export const Routes = () => (
  <Router>
  <React.Fragment>
    <nav className='pa3 pa4-ns'>
      <Link
         className='link dim black b f6 f5-ns dib mr3'
         to='/'
         title='Feed'
       >
         Blog
       </Link>
       <NavLink
         className='link dim f6 f5-ns dib mr3 black'
         activeClassName='gray'
         exact={true}
         to='/'
         title='Feed'
       >
         Feed
       </NavLink>
       <NavLink
         className='link dim f6 f5-ns dib mr3 black'
         activeClassName='gray'
         exact={true}
         to='/drafts'
         title='Drafts'
       >
         Drafts
       </NavLink>
       <NavLink
         className='link dim f6 f5-ns dib mr3 black'
         activeClassName='gray'
         exact={true}
         to='/stripe'
         title='Stripe'
       >
         Stripe
       </NavLink>
       <NavLink
         className='link dim f6 f5-ns dib mr3 black'
         activeClassName='gray'
         exact={true}
         to='/stripeExpress'
         title='Stripe Express'
       >
         Stripe Express
       </NavLink>
      {auth.isAuthenticated() ?
          <React.Fragment>
            <button onClick={() => auth.logout()} className='f6 link dim br1 ba ph3 pv2 fr mb2 dib black' >Log Out</button>
          <Link
              to='/create'
              className='f6 link dim br1 ba ph3 pv2 fr mb2 dib black'
          >
            + Create Draft
          </Link>
          </React.Fragment>
          : <button className='f6 link dim br1 ba ph3 pv2 fr mb2 dib black'  onClick={() => auth.login()} >Login</button>
      }
    </nav>
    <div className='fl w-100 pl4 pr4'>
      <Switch>
        <Route exact path='/' component={FeedPage} />
        <Route path='/stripeExpress' component={StripeExpressRegistrationPage} />
        <Route path='/stripe' component={StripeRegistrationPage} />
        <Route path='/drafts' component={DraftsPage} />
        <Route path='/create' component={CreatePage} />
        <Route path='/post/:id' component={DetailPage} />
        <Route path='/callback' render={(props) => {
          handleAuthentication(props)
          return <Callback {...props} />
        }}/>
      </Switch>
    </div>
  </React.Fragment>
  </Router>
);



export const Root = () => (
  <ApolloProvider client={client}>
      <Routes />
  </ApolloProvider>
);
