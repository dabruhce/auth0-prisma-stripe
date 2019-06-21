import React from 'react'
import { withRouter } from 'react-router-dom'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

class StripeRegistrationPage extends React.Component {
  state = {
    title: '',
    text: '',
    firstName: '',
    lastName: '',
    email: ''
  };


//  console.log(props);


  render() {
    return (
      <div className="pa4 flex justify-center bg-white">
        <form onSubmit={this.handlePost}>
          <h1>Register stripe</h1>
          <input
            autoFocus
            className="w-100 pa2 mv2 br2 b--black-20 bw1"
            onChange={e => this.setState({ firstName: e.target.value })}
            placeholder="First Name"
            type="text"
            value={this.state.firstName}
          />
          <input
            autoFocus
            className="w-100 pa2 mv2 br2 b--black-20 bw1"
            onChange={e => this.setState({ lastName: e.target.value })}
            placeholder="Last Name"
            type="text"
            value={this.state.lastName}
          />
          <input
            autoFocus
            className="w-100 pa2 mv2 br2 b--black-20 bw1"
            onChange={e => this.setState({ email: e.target.value })}
            placeholder="email"
            type="text"
            value={this.state.email}
          />
          <input
            className={`pa3 bg-black-10 bn ${this.state.text &&
              this.state.title &&
              'dim pointer'}`}
            disabled={!this.state.firstName || !this.state.lastName}
            type="submit"
            value="Create"
          />{' '}
          <a className="f6 pointer" onClick={this.props.history.goBack}>
            or cancel
          </a>
        </form>
      </div>
    )
  }


  handlePost = async e => {
    e.preventDefault()
    const { firstName, lastName, email } = this.state
    await this.props.createStripeCustomer({
      variables: { firstName, lastName, email },
    })
    this.props.history.replace('/drafts')
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
})(StripeRegistrationPage)

export default withRouter(CreatePageWithMutation)
