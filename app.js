// app.js

// Importa os módulos necessários
const express = require('express'); // Framework para criar servidores web
const sqlite3 = require('sqlite3').verbose(); // Biblioteca para trabalhar com SQLite
const swaggerJsDoc = require('swagger-jsdoc'); // Para gerar documentação Swagger
const swaggerUi = require('swagger-ui-express'); // Para servir a interface Swagger UI
const cors = require('cors');

// Cria uma instância do Express
const app = express();
const port = 3000; // Porta em que o servidor irá rodar

// Middleware para interpretar corpos de requisições em JSON
app.use(express.json());

// Habilita o CORS para todas as rotas
app.use(cors());

// Configura o banco de dados SQLite (em memória)
// let db = new sqlite3.Database(':memory:', (err) => {
let db = new sqlite3.Database('./banco_de_dados.sqlite', (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite em memória.');
    // Cria a tabela 'items' se não existir
    db.run(
      `CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          console.error('Erro ao criar tabela:', err.message);
        } else {
          console.log('Tabela "items" pronta para uso.');
        }
      }
    );
  }
});

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // Versão do OpenAPI
    info: {
      title: 'API Simples',
      version: '1.0.0',
      description: 'Uma API simples com operações CRUD básicas',
    },
  },
  apis: ['./app.js'], // Arquivos onde estão as anotações Swagger
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Rota para servir a documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: API para gerenciar itens
 */

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Retorna uma lista de itens
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: Lista de itens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
app.get('/items', (req, res) => {
  const sql = 'SELECT * FROM items';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao consultar itens:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Retorna um item pelo ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do item
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Um objeto item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *       404:
 *         description: Item não encontrado
 */
app.get('/items/:id', (req, res) => {
  const sql = 'SELECT * FROM items WHERE id = ?';
  const id = req.params.id;
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('Erro ao consultar item:', err.message);
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: 'Item não encontrado' });
    }
  });
});

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Cria um novo item
 *     tags: [Items]
 *     requestBody:
 *       description: Objeto do item a ser criado
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *       400:
 *         description: Entrada inválida
 */
app.post('/items', (req, res) => {
  const name = req.body.name;
  if (!name) {
    res.status(400).json({ error: 'O campo "name" é obrigatório' });
    return;
  }
  const sql = 'INSERT INTO items (name) VALUES (?)';
  db.run(sql, [name], function (err) {
    if (err) {
      console.error('Erro ao inserir item:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      // 'this.lastID' contém o ID do registro inserido
      res.status(201).json({ id: this.lastID, name });
    }
  });
});

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Atualiza um item existente
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do item a ser atualizado
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Objeto do item atualizado
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *       400:
 *         description: Entrada inválida
 *       404:
 *         description: Item não encontrado
 */
app.put('/items/:id', (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  if (!name) {
    res.status(400).json({ error: 'O campo "name" é obrigatório' });
    return;
  }
  const sql = 'UPDATE items SET name = ? WHERE id = ?';
  db.run(sql, [name, id], function (err) {
    if (err) {
      console.error('Erro ao atualizar item:', err.message);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: 'Item não encontrado' });
    } else {
      res.json({ id: Number(id), name });
    }
  });
});

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Remove um item
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do item a ser removido
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removido com sucesso
 *       404:
 *         description: Item não encontrado
 */
app.delete('/items/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM items WHERE id = ?';
  db.run(sql, id, function (err) {
    if (err) {
      console.error('Erro ao deletar item:', err.message);
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: 'Item não encontrado' });
    } else {
      res.json({ message: 'Item removido com sucesso' });
    }
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Documentação Swagger disponível em http://localhost:${port}/api-docs`);
});

