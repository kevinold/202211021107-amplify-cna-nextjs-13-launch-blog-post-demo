Cypress.Commands.add("loginWithCognitoUI", (username, password) => {
  cy.intercept("POST", "https://cognito-idp.*.amazonaws.com/**").as("loginPost");
  cy.intercept({
    method: "POST",
    url: "https://cognito-idp.*.amazonaws.com/**",
    headers: {
      "x-amz-target": "AWSCognitoIdentityProviderService.RespondToAuthChallenge",
    },
  }).as("RespondToAuthChallenge");
  cy.intercept(
    {
      method: "POST",
      url: "https://cognito-idp.*.amazonaws.com/**",
      headers: {
        "x-amz-target": "AWSCognitoIdentityProviderService.GetUser",
      },
    },
    (req) => {
      req.continue((res) => {
        expect(res.statusCode).to.equal(200);
      });
    }
  ).as("GetUser");
  cy.session([username, password], () => {
    cy.visit("/");
    cy.get("[data-amplify-authenticator-signin='']").within(() => {
      cy.get('input[name="username"]').type(username);
      cy.get('input[name="password"]').type(password, { force: true });
      cy.get("button[type='submit']").click({ force: true });
    });

    cy.wait("@loginPost");
    cy.wait("@RespondToAuthChallenge");
    cy.wait("@GetUser");
    cy.location("pathname").should("equal", "/");
  });
});
