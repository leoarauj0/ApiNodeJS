const express = require("express");

const User = require("../models/user");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const authConfig = require('../../config/auth');

const router = express.Router();

function geradorToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,    
    }); // sign = entrar ou login... pegamos o id de usuario... pegamos o token md5 unico da nossa app do nosso auth.json... e em seguida indicamos quando esse token expira ( em 86400 segundos ou 1 dia).
}

router.post('/registro', async (req, res) => {
    const {email} = req.body;
    const {nickname} = req.body;

    try {
        if (await User.findOne({email}))
        return res.status(400).send({error: 'Email já existe'});

        if (await User.findOne({nickname}))
        return res.status(400).send({error: 'Apelido já existe'});
      
        const user = await User.create(req.body);

        user.password = undefined;                                           //não retorna a senha

        return res.send({
            user,
            token: geradorToken({ id: user.id }),
        });
    } catch (err) {
        return res.status(400).send({error: 'Falha ao registrar'});
    }
});

router.post('/autenticacao', async (req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email}).select('+password');           //indica que ele quer encontar o email com a senha ( pois esta foi configurada antes para nao ser retornada no 'user')
    console.log(user);
    if (!user)
        return res.status(400).send({error: 'Usuário não encontrado'});

    if (!await bcrypt.compare(password, user.password))                     //verifica se as senhas não batem. await pq nao é uma função assincrona.
        return res.status(400).send({error: 'Senha invalida'});

    user.password = undefined;                                              //não retorna a senha

    res.send({
        user,
        token: geradorToken({ id: user.id }),
    });

    console.log(user);

});

router.post('/forgot_password', async(req, res) => {
    const {email} = req.body;

    try {
        const user = await User.findOne({email});

        if(!user)
            return res.status(400).send({error: 'Usuário não encontrado'})

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        console.log(token, now);

        mailer.sendMail({
            to:email,
            from: 'leocraraujo@gmail.com',
            template: 'auth/forgot_password',
            context: {token},
        }, (err) => {
            if (err)
                return res.status(400).send({ error: 'Não foi possivel enviar o email de recuperação de senha'});

                return res.send();
        })
    }catch (err) {
        console.log(err);
        res.status(400).send({error: 'Erro ao recuperar senha, tente novamente.'});
    }
});

router.post('/reset_password', async(req, res) => {
    const {email, token, password} = req.body;
    try {
        const user = await User.findOne({email})
            .select('+passwordResetToken passwordResetExpires');

        if(!user)
            return res.status(400).send({error: 'Usuário não encontrado.'});            
        
        if(token !== user.passwordResetToken)
            return res.status(400).send({error: 'Token invalido.'});
            
        const now = new Date();

        if(now > user.passwordResetExpires)
            return res.status(400).send({error: 'Token expirado, por favor gere um novo.'});
    
        user.password = password;

        await user.save();

        res.send();
        
        } catch (err) {
        res.status(400).send({error: 'Erro ao alterar a senha, tente novamente.'});
    }
});

module.exports = app => app.use('/auth', router);