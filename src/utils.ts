import {spawnSync} from 'child_process';

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

export function eoscTransfer(from: string, to: string, quantity: string, memo: string, options: {
    contract: string,
    writeTransaction: string,
    delaySec: number,
    expiration: number,
}) {
    // Required Options
    const delaySec = options.delaySec;
    const expiration = options.expiration;
    const contract = options.contract;
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
    expiration: number,
    writeTransaction: string,
}) {
    // Required Options
    const expiration = options.expiration;
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
    expiration: number,
    writeTransaction: string,
}) {
    // Required Options
    const expiration = options.expiration;
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
    expiration: number,
    writeTransaction: string,
}) {
    // Required Options
    const expiration = options.expiration;
    const writeTransaction = options.writeTransaction;

    return eosc([
        "multisig", "exec",
        proposer, proposalName, executer,
        "--expiration", String(expiration),
        "--skip-sign",
        "--write-transaction", writeTransaction
    ])
}
