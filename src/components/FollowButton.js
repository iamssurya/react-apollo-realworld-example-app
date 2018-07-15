import classNames from 'classnames'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'
import React from 'react'
import { Mutation } from 'react-apollo'
import { withRouter } from 'react-router-dom'
import WithMe from './WithMe'

const FOLLOW_USER = gql`
  mutation FollowUser($input: FollowUserInput!) {
    followUser(input: $input) {
      user {
        id
        following
        followersCount
      }
    }
  }
`

const UNFOLLOW_USER = gql`
  mutation UnfollowUser($input: UnfollowUserInput!) {
    unfollowUser(input: $input) {
      user {
        id
        following
        followersCount
      }
    }
  }
`

const FollowButton = ({ user, className, history }) => (
  <WithMe>
    {me => (
      <Mutation mutation={user.following ? UNFOLLOW_USER : FOLLOW_USER}>
        {mutate => (
          <button
            type="button"
            className={classNames('btn btn-sm', className, {
              'btn-outline-secondary': !user.following,
              'btn-secondary': user.following
            })}
            onClick={() => {
              if (!me) {
                history.push('/register')
                return
              }
              mutate({ variables: { input: { id: user.id } } })
            }}
          >
            <i className="ion-plus-round" />
            &nbsp;
            {user.following ? 'Unfollow' : 'Follow'} {user.username}
            &nbsp;
            <span className="counter">({user.followersCount})</span>
          </button>
        )}
      </Mutation>
    )}
  </WithMe>
)

FollowButton.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    following: PropTypes.bool.isRequired,
    followersCount: PropTypes.number.isRequired
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  className: PropTypes.string
}

FollowButton.defaultProps = {
  className: null
}

export default withRouter(FollowButton)
