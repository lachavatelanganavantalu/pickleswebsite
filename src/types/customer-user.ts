export interface CustomerUser {
  id: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export type PublicCustomerUser = Pick<CustomerUser, "id" | "phone" | "createdAt">;
