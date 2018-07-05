//esse middleware intercepta a requisição entre o cotroller e a rota,
//no momento que a rota chega no servidor e antes de chegar
//no controller ele passa pelo middleware para fazer verificações no token
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');

module.exports = (req, res, next) => {                                  //o next serve para que se ele nao for chamado ele para por aqui e nao segue na aplicação.
    const authHeader = req.headers.autorizacao;                         //autorizacao: nome que vai no header como chave para autorização, junto com o bearer e o hash no valor do header.

    if(!authHeader)
        return res.status(401).send({ error: 'Token não foi informado'});

    const parts = authHeader.split(' ');                                //O token começa sempre com Bearer + o hash, aqui separamos com um espaço com o split

    if (!parts.length === 2 )                                           //verifica se tem duas partes
        return res.status(401).send({error: 'Token errado'});

    const [ scheme, token ] = parts;                                    //desestrituração scheme recebe o bearer e token recebe o hash

    if(!/^Bearer$/i.test(scheme))                                       //regex: / começa ela, ^ inicio da verificação, a palavra que procuramos, $ para finalizar verificação, / para fechar, e o I para dizer que é caseInsensitive. 
        return res.status(401).send({error: 'Token mal formado'});

    jwt.verify(token, authConfig.secret, (err, decoded) => {            //verifica o token
        if (err) return res.status(401).send({error: 'Token Inválido'});

        req.userId = decoded.id;                                        //inclui a informação do UserId para as proximas req do controller.
        return next();
    });

};
