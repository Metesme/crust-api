import { mnemonicGenerate,
    naclDecrypt,
    naclEncrypt,
    randomAsU8a } from '@polkadot/util-crypto';
import { stringToU8a,
    hexToU8a,
    u8aToHex,
    u8aToString} from '@polkadot/util';
import {ApiPromise} from '@polkadot/api';
import {Keyring} from '@polkadot/keyring';
import {
    addressFromSeed,
    loadKeyringPairWithSeeds,
    queryToObj,
    sendTx,
} from './util';
import {logger} from '../log';

export async function sign(msg: string){
        const krp = loadKeyringPairWithSeeds("inquiry badge apology bullet estate drastic version jacket tooth virtual flee employ");
        const sign = krp.sign(stringToU8a(msg));
        const perSignData = `substrate-${msg}:${u8aToHex(sign)}`;
        return perSignData;
}

export async function joinGroup(
    api: ApiPromise,
    owner: string,
    seeds: string
){
    logger.info(`📦 [Ele]: Join group: ${owner}`);
    seeds = seeds.replace(/-/g, ' ');
    const tx = await api.tx.swork.joinGroup(
        owner
    );
    const krp = loadKeyringPairWithSeeds(seeds);
    const res = await sendTx(tx, krp);

    return res;
}

export async function allowList(
    api: ApiPromise,
    member: string,
    seeds: string
){
    logger.info(`📦 [Ele]: allowList: ${member}`);
    seeds = seeds.replace(/-/g, ' ');
    const tx = await api.tx.swork.addMemberIntoAllowlist(
        member
    );

    const krp = loadKeyringPairWithSeeds(seeds);
    const res = await sendTx(tx, krp);
    return res;
}
export async function checkGroup(
    api: ApiPromise,
    owner: string
){
    const res = {
        data: queryToObj(await api.query.swork.groups(owner)),
    };
    return res;
}
export async function removeGroup(
    api: ApiPromise,
    seeds: string
){
    seeds = seeds.replace(/-/g, ' ');
    const tx = await api.tx.swork.quitGroup();

    const krp = loadKeyringPairWithSeeds(seeds);
    const res = await sendTx(tx, krp);
    return res;
}

export async function createAccount(
    api: ApiPromise,
    name: string,
    password: string
) {

    logger.info(`📦 [Ele]: New account with name: ${name}`);
    const seed = mnemonicGenerate();
    const address = addressFromSeed(seed , '','sr25519');
    let tags: string[] = [];
    const kr = new Keyring({
        type: 'sr25519',
    });
    kr.setSS58Format(66)
    const krp = kr.addFromUri(seed);

    //const result = keyring.addUri(getSuri(seed, '', 'sr25519'), password, { undefined, isHardware: false, name, tags },  'sr25519');
    const result = krp.encodePkcs8(password).toString()
    const json = krp.toJson(password)
    json.meta.name = name
    json.meta.genesisHash = api.genesisHash.toHex()
    json.meta.tags = tags
    json.meta.whenCreated = Date.now()

    const res = {
        seed: seed,
        address:address,
        result:result,
        json:json
    };
    return res;
}
