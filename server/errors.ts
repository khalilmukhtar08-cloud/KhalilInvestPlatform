export class InsufficientFundsError extends Error {
  constructor(message: string = "Insufficient balance") {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

export class UserNotFoundError extends Error {
  constructor(message: string = "User not found") {
    super(message);
    this.name = "UserNotFoundError";
  }
}
