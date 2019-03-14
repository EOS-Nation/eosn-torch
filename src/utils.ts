import {spawnSync} from 'child_process';
import {Transaction} from "./interfaces";

export function cleos<T>(args: string[]): Promise<T> {
    const endpoint = "https://api.eosn.io";
    return new Promise((resolve) => {
        const spawn = spawnSync("cleos", ["-u", endpoint, ...args], {encoding: "utf8"});
        const std = spawn.stdout || spawn.stderr;

        let response;
        try {
            response = JSON.parse(std)
        } catch (e) {
            response = std
        }
        return resolve(response);
    })
}

export function eosc<T>(args: string[]): Promise<T> {
    return new Promise((resolve) => {
        const spawn = spawnSync("eosc", [...args], {encoding: "utf8"});
        const std = spawn.stdout || spawn.stderr;

        let response;
        try {
            response = JSON.parse(std)
        } catch (e) {
            response = std
        }
        return resolve(response);
    })
}

export function cleosTransfer(from: string, to: string, quantity: string, memo: string, options: {
    constract?: string,
    delaySec?: number,
    expiration?: number,
} = {}) {
    const contract = options.constract || "eosnationinc"
    const delaySec = options.delaySec || 10;
    const expiration = options.expiration || 604800;

    return cleos<Transaction>([
        "transfer", from, to, quantity, memo,
        "--contract", contract,
        "--delay-sec", String(delaySec),
        "--expiration", String(expiration),
        "--skip-sign",
        "--dont-broadcast"])
}

export function eoscTransfer(from: string, to: string, quantity: string, memo: string, options: {
    constract?: string,
    delaySec?: number,
    expiration?: number,
    writeTransaction: string,
} = {writeTransaction: ""}) {
    const contract = options.constract || "eosnationinc"
    const delaySec = options.delaySec || 10;
    const expiration = options.expiration || 36000;

    if (!options.writeTransaction) throw new Error("[options.writeTransaction] is required");
    const writeTransaction = options.writeTransaction;

    return eosc([
        "transfer", from, to, quantity,
        "--memo", memo,
        "--contract", contract,
        "--delay-sec", String(delaySec),
        "--expiration", String(expiration),
        "--skip-sign",
        "--write-transaction", writeTransaction
    ])
}

export function eoscMultisigPropose(proposer: string, proposalName: string, transactionFile: string, request: string, options: {
    expiration?: number,
    writeTransaction: string,
} = {writeTransaction: ""}) {
    const expiration = options.expiration || 36000;

    if (!options.writeTransaction) throw new Error("[options.writeTransaction] is required");
    const writeTransaction = options.writeTransaction;

    return eosc([
        "multisig", "propose",
        proposer, proposalName, transactionFile,
        "--request", request,
        "--expiration", String(expiration),
        "--skip-sign",
        "--write-transaction", writeTransaction
    ])
}

export function eoscMultisigApprove(proposer: string, proposalName: string, approver: string, options: {
    expiration?: number,
    writeTransaction: string,
} = {writeTransaction: ""}) {
    const expiration = options.expiration || 36000;

    if (!options.writeTransaction) throw new Error("[options.writeTransaction] is required");
    const writeTransaction = options.writeTransaction;

    return eosc([
        "multisig", "approve",
        proposer, proposalName, approver,
        "--expiration", String(expiration),
        "--skip-sign",
        "--write-transaction", writeTransaction
    ])
}

export function eoscMultisigExec(proposer: string, proposalName: string, executer: string, options: {
    expiration?: number,
    writeTransaction: string,
} = {writeTransaction: ""}) {
    const expiration = options.expiration || 36000;

    if (!options.writeTransaction) throw new Error("[options.writeTransaction] is required");
    const writeTransaction = options.writeTransaction;

    return eosc([
        "multisig", "exec",
        proposer, proposalName, executer,
        "--expiration", String(expiration),
        "--skip-sign",
        "--write-transaction", writeTransaction
    ])
}
