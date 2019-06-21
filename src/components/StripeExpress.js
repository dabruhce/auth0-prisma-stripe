import React from 'react'
import { withRouter } from 'react-router-dom'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const stripeUrl = "https://connect.stripe.com/express/oauth/authorize?redirect_uri=https://localhost:8000/callback&client_id=${$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$}&state=cx92391201234"

class StripeExpressRegistrationPage extends React.Component {



  render() {
    return (
      <div className="pa4 flex justify-center bg-white">
      <a
        className="f6 dim br1 ba ph3 pv2 mb2 dib black pointer"
        href={stripeUrl}
      >
      stripe express
      </a>{' '}
      </div>
    )
  }

}

const CREATE_DRAFT_MUTATION = gql`
  mutation createStripeCustomer($firstName: String!, $lastName: String!, $email: String!) {
    createStripeUser(firstName: $firstName, lastName: $lastName, email: $email) {
      id
      firstName
      lastName
      email
    }
  }
`

const CreatePageWithMutation = graphql(CREATE_DRAFT_MUTATION, {
  name: 'createStripeCustomer', // name of the injected prop: this.props.createDraftMutation...
})(StripeExpressRegistrationPage)

export default withRouter(CreatePageWithMutation)
