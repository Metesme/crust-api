import {ApiPromise} from '@polkadot/api';
import {loadKeyringPair, loadKeyringPair2, queryToObj, sendTx} from './util';
import {logger} from '../log';

// Queries
export async function file(api: ApiPromise, cid: string) {
  logger.info(`📦 [market]: Query file order with cid: ${cid}`);
  const [fileInfo, _usedInfo] = queryToObj(await api.query.market.files(cid));
  return fileInfo;
}

export async function fileBalance(api: ApiPromise) {
  //logger.info(`📦 [market]: Query file order with cid: ${cid}`);
    const res = {
        balance:queryToObj(await api.query.market.fileBaseFee())
    }
 return  res;
 // return fileInfo;
}


export async function storageOrder(api: ApiPromise, cid: string,seeds: string,size: number) {
    logger.info(`📦 [market]: New order with cid: ${cid}`);
    const tx = api.tx.market.placeStorageOrder(
        cid,
        size ,
        0
      );
    const krp = loadKeyringPair2(seeds);
    const res = await sendTx(tx, krp);
    return  res;
}
