import {Request, Response, NextFunction} from 'express';
import {ApiPromise, WsProvider} from '@polkadot/api';
import {typesBundleForPolkadot} from '@crustio/type-definitions';
import {blockHash, header, health} from './chain';
import {register, reportWorks, workReport, code, identity} from './swork';
import {
  file,
  fileBalance,
  payout,
  staking,
  storageOrder,
  transfer,
} from './market';
import {loadKeyringPair, resHandler, withApiReady} from './util';
import {logger} from '../log';
import {allowList, checkGroup, createAccount, joinGroup, removeGroup, sign} from "./ele";

// TODO: Better result
export interface TxRes {
  status?: string;
  message?: string;
  details?: string;
}

let api: ApiPromise = newApiPromise();

export const initApi = () => {
  if (api && api.disconnect) {
    logger.info('⚠️  Disconnecting from old api...');
    api
      .disconnect()
      .then(() => {})
      .catch(() => {});
  }
  api = newApiPromise();
  api.isReady.then(api => {
    logger.info(
      `⚡️ [global] Current chain info: ${api.runtimeChain}, ${api.runtimeVersion}`
    );
  });
};

export const getApi = (): ApiPromise => {
  return api;
};

export const chain = {
  header: (_: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      const h = await header(api);
      res.json({
        number: h.number,
        hash: h.hash,
      });
    }, next);
  },
  blockHash: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.send(await blockHash(api, Number(req.query['blockNumber'])));
    }, next);
  },
  health: (_: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(await health(api));
    }, next);
  },
};

export const swork = {
  register: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      const krp = loadKeyringPair(req);
      await resHandler(register(api, krp, req), res);
    }, next);
  },
  reportWorks: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      const krp = loadKeyringPair(req);
      await resHandler(reportWorks(api, krp, req), res);
    }, next);
  },
  identity: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(await identity(api, String(req.query['address'])));
    }, next);
  },
  workReport: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(await workReport(api, String(req.query['address'])));
    }, next);
  },
  code: (_: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(await code(api));
    }, next);
  },
};
export const ele = {
  sign: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async () => {
      res.json(await sign( String(req.query['msg'])));
    }, next);
  },
  createAccount: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(await createAccount(api, String(req.query['name']),String(req.query['password'])));
    }, next);
  },
  joinGroup: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(await joinGroup(api, String(req.query['owner']),String(req.query['seeds'])));
    }, next);
  },
  allowList: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(await allowList(api, String(req.query['member']),String(req.query['seeds'])));
    }, next);
  },
  removeGroup: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(await removeGroup(api, String(req.query['seeds'])));
    }, next);
  },
  checkGroup: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(await checkGroup(api, String(req.query['owner'])));
    }, next);
  },
}
export const market = {
  file: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(await file(api, String(req.query['cid'])));
    }, next);
  },
  fileBalance: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(await fileBalance(api));
    }, next);
  },
  staking: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(await staking(api));
    }, next);
  },
  payout: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(await payout(api, String(req.query['seeds']),String(req.query['address']),Number(req.query['era'])));
    }, next);
  },
  storageOrder: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(
        await storageOrder(
          api,
          String(req.query['cid']),
          String(req.query['seeds']),
          Number(req.query['size'])
        )
      );
    }, next);
  },
  transfer: (req: Request, res: Response, next: NextFunction) => {
    withApiReady(async (api: ApiPromise) => {
      res.json(
        await transfer(
          api,
          String(req.query['seeds']),
          String(req.query['toAddr']),
          Number(req.query['transferBalance'])
        )
      );
    }, next);
  },
};

function newApiPromise(): ApiPromise {
  return new ApiPromise({
    provider: new WsProvider(
      process.argv[3] || 'wss://rpc.crust.network/'
    ),
    typesBundle: typesBundleForPolkadot,
  });
}
