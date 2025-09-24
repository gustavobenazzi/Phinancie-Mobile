const express = require('express');
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();
const app = express();


app.use(express.json());

//lista todas as metas (Read)
app.get('/metas', async(req,res) => {
    const metas = await prisma.meta_financeiro.findMany();
    res.json(metas);

})

//Criar nova meta (Create)
app.post('/metas', async(req,res) =>{
    const {codigo_usuario,titulo_meta,valor,data_final} = req.body;
    const meta = await prisma.meta_financeiro.create({
        data:{
            codigo_usuario,
            titulo_meta,
            valor,
            data_final: new Date(data_final),


        }
    });
    res.json(meta)
})

//Editar meta (Update)

app.put('/metas/:id', async(req,res) =>{
    const {id} = req.params;
    const {titulo_meta,valor,data_final} = req.body;
    const meta = await prisma.meta_financeiro.update({
        where:{ id: parseInt(id)},
    data:{
        titulo_meta,
        valor,
        data_final: new Date(data_final),
    },
    });
    res.json(meta)

});

//Deletar meta (Delete)

app.delete('/metas/:id', async(req,res) =>{
    const {id} = req.params;
    await prisma.meta_financeiro.delete({
        where:{ id:parseInt(id)},
    });
    res.json("Meta removida com sucesso!")
})

