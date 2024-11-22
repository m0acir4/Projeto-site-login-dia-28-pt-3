import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

app.post('/usuarios', async (req, res) => {
    const { email, name, age } = req.body;

    const encodedName = Buffer.from(name).toString('base64');

    await prisma.user.create({
        data: {
            email,
            name: encodedName,
            age,
        },
    });

    res.status(201).json(req.body);
});

// Rota para obter todos os usuários ou filtrar por query
app.get('/usuarios', async (req, res) => {
    let users = [];

    if (req.query) {
        users = await prisma.user.findMany({
            where: {
                name: req.query.name,
                email: req.query.email,
                age: req.query.age,
            },
        });
    } else {
        users = await prisma.user.findMany();
    }

    res.status(200).json(users);
});

app.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { email, name, age } = req.body;

    try {
        // Codificando o nome antes de salvar no banco
        const encodedName = Buffer.from(name).toString('base64');

        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: {
                email: email,
                name: encodedName,  // Codificando o nome antes de salvar
                age: age,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});


// Rota para deletar um usuário
app.delete('/usuarios/:id', async (req, res) => {
    await prisma.user.delete({
        where: {
            id: req.params.id,
        },
    });

    res.status(200).json({ message: 'Usuário deletado com sucesso!' });
});

// Rota de login
app.post('/login', async (req, res) => {
    const { email, name } = req.body;

    // Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    // Se o usuário não for encontrado
    if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    // Decodificar o nome do usuário
    const decodedName = Buffer.from(user.name, 'base64').toString('utf-8');

    // Verificar se o nome está correto
    if (decodedName !== name) {
        return res.status(401).json({ message: 'Nome incorreto' });
    }

    // Login bem-sucedido
    res.status(200).json({ message: 'Login bem-sucedido' });
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
