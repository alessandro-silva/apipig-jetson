/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'reflect-metadata';
import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import WebSocket from 'ws';
import 'express-async-errors';
import { errors } from 'celebrate';
import { Server } from 'socket.io';
import { spawn } from 'child_process';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

import uploadConfig from '@config/upload';
import AppError from '@shared/errors/AppError';
import routes from './routes';
// import rateLimiter from './middlewares/rateLimiter';
// import upload from '@config/upload';

import '@shared/infra/typeorm';
import '@shared/container';

const app = express();

let cppProcess: any;
let idCounting: any;

// Não inserir URL de acesso prioritario
// console.log('API CHEGOU NO CORS');
// app.use(cors());

//SERIAL PORT
const port = new SerialPort({
  path: '/dev/ttyUSB0',
  baudRate: 9600,
});

app.use(bodyParser.json({ limit: '50mb' }));

app.use(
  cors({
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

const serverHttp = http.createServer(app);
const io = new Server(serverHttp, {
  cors: {
    origin: '*',
  },
});

const wss = new WebSocket.Server({ server: serverHttp });

io.on('connection', socket => {
  console.log(`Usuário conectado no socket ${socket.id}`);
});

const options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders(res: any, path: string, stat: any) {
    res.set('x-timestamp', Date.now());
  },
};

app.use(
  '/processes/file',
  express.static(`${uploadConfig.tmpFolder}/processes/file`, options),
);
app.use(express.json());

// app.use('/image', express.static(`${upload.tmpFolder}/car/image`));
// app.use('/document', express.static(`${upload.tmpFolder}/car/document`));
// app.use(rateLimiter);
app.use(routes);
app.use(errors());

app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

app.get('/spawn', async (req, res) => {
  const {
    cfg,
    names,
    weights,
    saveVideo,
    roteViewVideo,
    mountVideo,
    type,
    producer_id,
    nfe,
  } = req.query;

  const data = {
    quantity: 0,
    weight: 0,
    start_date: new Date(),
    type: type,
    producer_id,
    nfe,
  };

  try {
    const response = await fetch('http://localhost:3333/scores', {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const dataFormated: { id: string } = await response.json();

    idCounting = dataFormated.id;


    console.log('Rota /spawn foi acessada. Iniciando o programa C++...');

    // Iniciar o programa C++ como um processo separado
    cppProcess = spawn('/home/jet/projects/darknet_test/main', [
      idCounting,
      cfg,
      names,
      weights,
      saveVideo,
      roteViewVideo,
      mountVideo,
    ]);

    cppProcess.stdout.on('data', (data: any) => {
      console.log(`Saída do programa C++: ${data}`);
      // Aqui você pode enviar a saída para o cliente WebSocket, se necessário
    });

    cppProcess.stderr.on('data', (data: any) => {
      console.error(`Erro do programa C++: ${data}`);
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send('program_error');
        }
      });
      // Aqui você pode lidar com os erros do programa C++
    });

    cppProcess.on('close', (code: any) => {
      console.log(`Programa C++ encerrado com código de saída ${code}`);

      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send('program_finalized');
        }
      });
    });

    res.status(200).json({ message: 'Programa C++ iniciado' });
  } catch (e) {
    console.log(e)
    res
      .status(500)
      .json({ message: `Problemas ao executar programa. ERROR: ${e}` });
  }
});
//STREAM 2

app.get('/video', (req, res) => {
  const { videoPath } = req.query; // Path to your video file
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

// Start the server
// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });

//APP
app.get('/videos', (req, res) => {
  const videos = fs.readdirSync('videos');

  const videosMap = videos.map(video => {
    return `${__dirname}${'/'}videos${'/'}${video}`;
    // return `C:/Users/bruno.carvalho/MidasCorp/WebServices-server${'/'}videos${'/'}${video}`
  });

  res.json(videosMap);
});

app.get('/scale', (req, res) => {
  const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));


  parser.on('data', handleSendData);

  function handleSendData(scale: string) {
    res.status(200).json({
      scale: scale,
    });
    parser.pause();
  }
});

// WebSocket
wss.on('connection', function connection(ws) {
  console.log('Cliente conectado!');

  ws.on('message', function incoming(message: any) {
    const msgString = Buffer.from(message).toString();
    console.log('Mensagem recebida do cliente:', msgString);

    // Tratamento das mensagens recebidas
    if (msgString === 'roudProgram') {
      // Se a mensagem for 'roudProgram', não será mais necessário iniciar o programa aqui
      console.log(
        'Agora a inicialização do programa é realizada pela rota /spawn',
      );
    }

    // Broadcast da mensagem recebida para todos os clientes conectados
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN && idCounting) {
        const formatedData = `${msgString} ${idCounting}`;
        client.send(formatedData);
      }
    });
  });
});

// Rota de autenticação básica
app.post('/authentication', (req, res) => {
  console.log('Rota POST de autenticação chamada');
  const { username, password } = req.body;

  // Lógica de autenticação básica
  if (username === 'usuario' && password === 'senha') {
    res.status(200).json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

app.post('/terminateProgram', (req, res) => {
  console.log('Encerrando o programa C++');
  terminateCppProgram(); // Função que encerra o programa C++
  res.status(200).json({ message: 'Programa C++ encerrado' });
});

const terminateCppProgram = () => {
  // var proc = require('child_process').spawn('mongod');
  cppProcess.kill('SIGINT');

  wss.clients.forEach(function each(client) {
    client.send('program_finalized');
  });
};

app.delete('/videos/:videoName', (req, res) => {
  const videoName = req.params.videoName; // Obtém o nome do vídeo dos parâmetros da URL
  // const videoPath = path.join('/videos', videoName); // Caminho completo para o vídeo
  const videoPath = path.resolve(__dirname, '..', '..', '..', '..', 'videos');

  fs.unlink(videoPath, async err => {
    const filename = path.resolve(videoPath, videoName);
    console.log('filename', filename);

    try {
      await fs.promises.stat(filename);
    } catch {
      return res.json({ message: 'Video not deleted.' });
    }

    await fs.promises.unlink(filename);

    return res.json({ message: 'Video deleted.' });
    // if (err) {
    //   console.error('Erro ao excluir o vídeo:', err);
    //   res.status(500).json({ error: 'Erro ao excluir o vídeo' });
    // } else {
    //   console.log('Vídeo excluído com sucesso:', videoName);
    //   res.status(200).json({ message: 'Vídeo excluído com sucesso' });
    // }
  });
});

// Rota para baixar um vídeo específico pelo seu nome
app.get('/videos/:videoName', (req, res) => {
  // const { videoName } = req.query
  const videoName = req.params.videoName;
  const videoPath = path.resolve(__dirname, '..', '..', '..', '..', 'videos');

  console.log('VIDEO', videoName);
  const video = path.join(videoPath, videoName); // Caminho completo para o vídeo

  res.download(video, err => {
    if (err) {
      console.error('Erro ao baixar o vídeo:', err);
      res.status(500).json({ error: 'Erro ao baixar o vídeo' });
    } else {
      console.log('Vídeo enviado com sucesso:', videoName);
    }
  });
});

export { serverHttp, io };
