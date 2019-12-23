
import {login} from '../../support/utils'

describe('Login Spec', function() {
  beforeEach(() => {
    cy.app('clean') // have a look at cypress/app_commands/clean.rb
  })

  it('Sign in view', function() {
    login()
  })

})