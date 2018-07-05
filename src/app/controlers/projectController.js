const express = require("express");
const authMiddleware = require("../middlewares/auth");

const Project = require('../models/Project');
const Task = require('../models/Task');

const router = express.Router();

router.use(authMiddleware);  // usa o auth do middleware para verificar o token de autenticação.

router.get('/', async (req, res) => {
    try{
        const projects = await Project.find().populate(['user', 'tasks']);

        return res.send({ projects });
    } catch (err){
        return res.status(400).send({ error: 'Erro ao carregar projetos.'});
    }
});

router.get('/:projectId', async (req, res) => {
    try{
        const project = await Project.findById(req.params.projectId).populate(['user', 'tasks']);

        return res.send({ project });
    } catch (err){
        return res.status(400).send({ error: 'Erro ao carregar projeto.'});
    }
});

router.post('/', async (req, res) => {
    try{
        const { titulo, descricao, tasks } = req.body;

        const project = await Project.create({ titulo, descricao, user: req.userId });

        await Promise.all( tasks.map( async task => {                                      //Promise.all aguarda todas as promisses criadas aq de task para ai sim passar pra proxima linha de codigo que é para salvar
            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();
            
            project.tasks.push(projectTask);
        }));

        await project.save();

        return res.send({ project });
    } catch (err){
        console.log(err);
        return res.status(400).send({ error: 'Erro ao criar projeto.'});
        
    }
});

router.put('/:projectId', async (req, res) => {
    try{
        const { titulo, descricao, tasks } = req.body;

        const project = await Project.findByIdAndUpdate( req.params.projectId, {
            titulo,
            descricao
        }, { new: true });                                                                 // o mongoose nao retorna o obj atualizado e o { new: true } tras ele atualizado.

        project.tasks = [];
        await Task.remove({ project: project._id});                                        // aqui ele deleta todas as tasks do projeto para depois recriar todas as que sobrarem na atualização.

        await Promise.all( tasks.map( async task => {                                      //Promise.all aguarda todas as promisses criadas aq de task para ai sim passar pra proxima linha de codigo que é para salvar
            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();
            
            project.tasks.push(projectTask);
        }));

        await project.save();

        return res.send({ project });
    } catch (err){
        console.log(err);
        return res.status(400).send({ error: 'Erro ao atualizar projeto.'});
        
    }
});

router.delete('/:projectId', async (req, res) => {
    try{
        await Project.findByIdAndRemove(req.params.projectId);

        return res.send();
    } catch (err){
        return res.status(400).send({ error: 'Erro ao deletar projeto.'});
    }
});

module.exports = app => app.use('/projetos', router);