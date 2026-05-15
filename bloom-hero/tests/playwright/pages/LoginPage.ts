import type { Page } from "@playwright/test";

export class LoginPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.page.getByTestId("login-email").fill(email);
    await this.page.getByTestId("login-password").fill(password);
    await this.page.getByTestId("login-submit").click();
  }

  emailInput() {
    return this.page.getByTestId("login-email");
  }

  passwordInput() {
    return this.page.getByTestId("login-password");
  }

  submitButton() {
    return this.page.getByTestId("login-submit");
  }

  googleButton() {
    return this.page.getByRole("button", { name: /login with google/i });
  }

  forgotPasswordLink() {
    return this.page.getByRole("link", { name: /forgot your password/i });
  }

  signUpLink() {
    return this.page.getByRole("link", { name: /sign up/i });
  }

  statusMessage() {
    return this.page.getByTestId("login-status");
  }

  logo() {
    return this.page.getByAltText("BloomHero Logo");
  }
}
