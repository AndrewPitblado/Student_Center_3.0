export interface CreateUserDTO {
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

export interface UserLoginDTO {
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
  userId: string;
  password: string;
}
