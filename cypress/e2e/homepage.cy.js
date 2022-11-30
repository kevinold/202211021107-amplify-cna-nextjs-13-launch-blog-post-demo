/// <reference types="cypress" />

describe("shared todos functionality", () => {
  let ctx = {};
  before(() => {
    cy.fixture("users").then((usersJson) => {
      ctx.primaryUser = usersJson[0];
      ctx.secondaryUser = usersJson[1];
    });
  });

  beforeEach(() => {
    cy.loginWithCognitoUI(ctx.primaryUser.email, Cypress.env("testUserPassword"));
    cy.visit("/");

    cy.intercept("POST", Cypress.env("appSyncGraphQLEndpoint"), (req) => {
      if (req.body.hasOwnProperty("query") && req.body.query.includes("query ListTodos")) {
        req.alias = "gqlListTodosQuery";
      }

      if (req.body.hasOwnProperty("query") && req.body.query.includes("mutation CreateTodo")) {
        req.alias = "gqlCreateTodoMutation";
      }
    });

    cy.wait("@gqlListTodosQuery");
  });

  it("displays user information", () => {
    cy.getBySel("user-email").should("have.text", ctx.primaryUser.email);
  });

  it("should not have any records", () => {
    cy.getBySelLike("todo-id-").should("not.exist");
  });
});
