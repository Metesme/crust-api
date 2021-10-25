import {ApiPromise} from '@polkadot/api';
import {
  loadKeyringPair,
  loadKeyringPairWithSeeds,
  queryToObj,
  sendTx,
} from './util';
import {logger} from '../log';

// Queries
export async function file(api: ApiPromise, cid: string) {
  logger.info(`📦 [market]: Query file order with cid: ${cid}`);
  const [fileInfo, _usedInfo] = queryToObj(await api.query.market.files(cid));
  return fileInfo;
}

export async function fileBalance(api: ApiPromise) {
  const res = {
    balance: queryToObj(await api.query.market.fileBaseFee()),
  };
  return res;
}

export async function staking(api: ApiPromise) {
  const res = {
    //data: queryToObj(await api.derive.staking.overview()),
    data: queryToObj(await api.query.transactionPayment.nextFeeMultiplier()),
  };
  return res;
}

export async function payout(api: ApiPromise, seeds: string, addr:string, era: Number) {
  logger.info(`${seeds}`);
  seeds = seeds.replace(/-/g, ' ');
  const tx = await api.tx.staking.rewardStakers(
      addr,
      era
  );
  const krp = loadKeyringPairWithSeeds(seeds);
  const res = await sendTx(tx, krp);
  return res;
}

export async function storageOrder(
  api: ApiPromise,
  cid: string,
  seeds: string,
  size: number
) {
  seeds = seeds.replace(/-/g, ' ');
  logger.info(`📦 [market]: New order with cid: ${cid}`);
  // eslint-disable-next-line eqeqeq
  if (cid.startsWith('Qm')) {
    return 'invalid cid';
  }
  const tx = api.tx.market.placeStorageOrder(cid, size,0, 0);
  const krp = loadKeyringPairWithSeeds(seeds);
  const res = await sendTx(tx, krp);
  return res;
}

export async function transfer(
  api: ApiPromise,
  seeds: string,
  toAddr: string,
  transferBalance: number
) {
  seeds = seeds.replace(/-/g, ' ');
  logger.info(`${seeds},${toAddr},${transferBalance}`);
  const bn = Math.pow(10, 12);
  transferBalance = transferBalance * bn;
  const tx = api.tx.balances.transfer(toAddr, transferBalance);
  const krp = loadKeyringPairWithSeeds(seeds);
  const res = await sendTx(tx, krp);
  //892h@fsdf11ks8sk^source2h8s8shfs.jk39hsoi@hohskd
  return res;
}
