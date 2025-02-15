import express, {NextFunction} from 'express';
import {Request, Response} from 'express';
import {logger} from './log';
import * as services from './services';
import * as bodyParser from 'body-parser';
import timeout from 'connect-timeout';

const app = express();
const PORT = process.argv[2] || 56667;

const errorHandler = (
  err: any,
  _req: Request | null,
  res: Response | null,
  _next: any
) => {
  const errMsg: string = '' + err ? err.message : 'Unknown error';
  logger.error(`☄️ [global]: Error catched: ${errMsg}.`);
  if (res) {
    res.status(400).send({
      status: 'error',
      message: errMsg,
    });
  }

  services.initApi();
  logger.warn('📡 [global]: Connection reinitialized.');
};

const loggingResponse = (_: Request, res: Response, next: NextFunction) => {
  const send = res.send;
  res.send = function (...args: any) {
    if (args.length > 0) {
      logger.info(`  ↪ [${res.statusCode}]: ${args[0]}`);
    }
    send.call(res, ...args);
  } as any;
  next();
};

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json());
app.use(loggingResponse);

// API timeout handler
app.use(timeout('600s'));

// Get routes
app.get('/api/v1/block/header', services.chain.header);
app.get('/api/v1/block/hash', services.chain.blockHash);
app.get('/api/v1/system/health', services.chain.health);
app.get('/api/v1/swork/workreport', services.swork.workReport);
app.get('/api/v1/swork/code', services.swork.code);
app.get('/api/v1/swork/identity', services.swork.identity);
app.get('/api/v1/market/file', services.market.file);
//fileBalance
app.get('/api/v1/market/fileBalance', services.market.fileBalance);
app.get('/api/v1/market/staking', services.market.staking);
// Post routes
app.post('/api/v1/swork/identity', services.swork.register);
app.post('/api/v1/swork/workreport', services.swork.reportWorks);
//storageOrder
app.get('/api/v1/market/storageOrder', services.market.storageOrder);

app.get('/api/v1/market/transfer', services.market.transfer);
app.get('/api/v1/market/payout', services.market.payout);
//createAccount
app.get('/api/v1/ele/createAccount', services.ele.createAccount);
app.get('/api/v1/ele/joinGroup', services.ele.joinGroup);
//allowList
app.get('/api/v1/ele/allowList', services.ele.allowList);
//removeGroup
app.get('/api/v1/ele/removeGroup', services.ele.removeGroup);
//checkGroup
app.get('/api/v1/ele/checkGroup', services.ele.checkGroup);
//sign
app.get('/api/v1/ele/sign', services.ele.sign);

// Error handler
app.use(errorHandler);
process.on('uncaughtException', (err: Error) => {
  logger.error(`☄️ [global] Uncaught exception ${err.message}`);
  errorHandler(err, null, null, null);
});

app.listen(PORT, () => {
  logger.info(
    `⚡️ [global]: Crust API is running at https://localhost:${PORT}`
  );
});
