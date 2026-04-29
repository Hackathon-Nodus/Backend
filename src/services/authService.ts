// interface AuthPayload {
//     email?: string;
//     password?: string;
//     name?: string;
// }

// export const registerAdmin = async (payload: AuthPayload): Promise<AuthPayload> => {
//     return {
//         name: payload.name,
//         email: payload.email
//     };
// };

// export const loginAdmin = async (payload: AuthPayload): Promise<{ token: string }> => {
//     if (!payload.email || !payload.password) {
//         throw new Error('Email and password are required');
//     }

//     return { token: 'demo-token' };
// };




interface AuthPayload {
  email?: string;
  password?: string;
  name?: string;
}

export const registerAdmin = async (payload: AuthPayload) => {
  const { name, email, password } = payload;

  //  validation
  if (!name || !email || !password) {
    throw new Error("Name, email and password are required");
  }

  // (later: check DB + save user)

  return {
    name,
    email,
  };
};

export const loginAdmin = async (payload: AuthPayload) => {
  const { email, password } = payload;

//    validation
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // (later: check DB + compare password)

  return {
    token: "demo-token",
  };
};