import bcrypt from 'bcrypt';
import db from '../../config/db';
import jwt from 'jsonwebtoken';

export const generatePassword = (req, res) => {
  const {password} = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  res.json({status: 1, hash});
};

export const checkUsername = async (req, res) => {
  const {username} = req.query;
  try {
    const result = await db('user').where({username}).select('username');
    res.json({data: result});
  } catch (err) {
    console.log(err);
    res.json({result: 'err'});
  }
};

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        res.sendStatus(403);
        return res.json({status: 0, message: 'Invalid Authenticate'});
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
    res.json({status: 0, message: 'Invalid Authenticate'});
  }
};

export const authLogin = async (req, res) => {
  const {username, password} = req.body;
  try {
    const user = await db('user').where({username}).first();
    if (!user) {
      res.json({status: 0, message: 'Incorrect username or password'});
    } else if (user.status !== 'active') {
      res.json({status: 0, message: 'User ini sudah tidak aktif'});
    } else {
      const perms = await db('user_perms')
        .select('user_perms.hash')
        .where('user_id', user.id)
        .first();
      const checkPass = bcrypt.compareSync(password, user.password);
      const payload = {id: user.id, username: user.username, role: user.role};
      console.log(user);
      if (checkPass) {
        const accessToken = jwt.sign(payload, process.env.SECRET_KEY);
        const {fullname, role, id, avatar, address, phone, gender} = user;
        res.json({
          status: 1,
          message: 'success',
          accessToken,
          user: {
            fullname,
            role,
            id,
            avatar,
            address,
            phone,
            gender,
            perms: perms ? JSON.parse(perms.hash) : [],
          },
        });
      } else {
        res.json({status: 0, message: 'Incorrect username or password'});
      }
    }
  } catch (err) {
    console.log('maneror', err);
    res.json({status: 0, message: 'Error'});
  }
};
