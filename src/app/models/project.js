const mongoose = require("../../database");
const bcrypt = require('bcryptjs');

const ProjectSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
    },

    descricao: {
        type: String,
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,    //pega o usuario pelo id no mongo
        ref: 'User',                             //referencia ao model de usuario
        require: true 

    },

    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    }],


    createdAt: {
        type: Date,
        default: Date.now,
    },
});



const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;