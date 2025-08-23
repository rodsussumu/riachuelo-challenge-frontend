export interface UserRequest {
  username: String;
  password: String;
}

export interface UserLoginResponse {
  username: String;
  token: String;
}

export interface UserRegisterResponse {
  username: String;
  message: String;
}
