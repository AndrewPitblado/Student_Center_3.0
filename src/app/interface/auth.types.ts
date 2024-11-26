export interface User {
  userNum: number;
  firstname: string;
  middlename: string;
  lastname: string;
  birthday: string;
  socialInsuranceNum: string;
  email: string;
  phoneNum: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  isAdmin: boolean;
}

export interface LoginDTO {
  userId: string;
  password: string;
  userNum: number;
}

export interface UserDTO {
  userNum: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthday: string;
  socialInsuranceNum: string;
  email: string;
  phoneNum: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  isAdmin: boolean;
}

export interface LoginCredentials {
  userId: string;
  password: string;
}

export interface LoginResponse {
  UserId: string;
  Password: string;
  userNum: number;
}
