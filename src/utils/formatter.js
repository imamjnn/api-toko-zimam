import bcrypt from 'bcrypt';

export const hashPassword = value => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(value, salt);
  return hash;
};
