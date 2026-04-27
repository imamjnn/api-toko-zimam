import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const hashPassword = value => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(value, salt);
  return hash;
};

export const getUserInfo = authToken => {
  const token = authToken.split(' ')[1];
  const user = authToken
    ? jwt.verify(token, process.env.SECRET_KEY, (err, result) => {
        if (!err) {
          return result;
        }
      })
    : null;
  return user;
};

export const checkUnit = name => {
  const unit = name === 'Lusin' ? 12 : name === 'Kodi' ? 20 : 1;
  return unit;
};

export const formatRupiah = number => {
  return 'Rp' + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
