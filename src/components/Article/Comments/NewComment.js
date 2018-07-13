import gql from 'graphql-tag'
import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { Mutation } from 'react-apollo'
import { Link } from 'react-router-dom'
import WithCurrentUser from '../../WithCurrentUser'
import Comment from './Comment'
import CommentForm from './Form'

const ADD_COMMENT = gql`
  mutation AddComment($articleId: ID!, $body: String!) {
    addComment(articleId: $articleId, body: $body) {
      comment {
        ...Comment
      }
      errors {
        message
      }
    }
  }
  ${Comment.fragments.comment}
`

const GET_ARTICLE_COMMENTS = gql`
  query ArticleComments($slug: String!) {
    article(slug: $slug) {
      id
      slug
      comments {
        ...Comment
      }
    }
  }
  ${Comment.fragments.comment}
`

const NewComment = ({ article }) => (
  <WithCurrentUser>
    {(currentUser) => {
      if (!currentUser) {
        return (
          <Fragment>
            <Link to="/login">Sign in</Link> or <Link to="/register">sign up</Link>{' '}
            to add comments on this article.
          </Fragment>
        )
      }

      return (
        <Mutation
          mutation={ADD_COMMENT}
          update={(cache, { data }) => {
            if (!_.isEmpty(data.addComment.errors)) return

            const cacheData = cache.readQuery({
              query: GET_ARTICLE_COMMENTS,
              variables: { slug: article.slug }
            })
            cacheData.article.comments.unshift(data.addComment.comment)
            cache.writeQuery({
              query: GET_ARTICLE_COMMENTS,
              variables: { slug: article.slug },
              data: cacheData
            })
          }}
        >
          {addComment => (
            <CommentForm
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                const { data } = await addComment({
                  variables: { ...values, articleId: article.id }
                })

                if (!_.isEmpty(data.addComment.errors)) {
                  setSubmitting(false)
                  return
                }

                resetForm()
              }}
            />
          )}
        </Mutation>
      )
    }}
  </WithCurrentUser>
)

NewComment.propTypes = {
  article: PropTypes.shape({
    id: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired
  }).isRequired
}

export default NewComment