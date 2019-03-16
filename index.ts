import * as load from "load-json-file";
import * as write from "write-json-file";
import * as path from "path";
import { eoscTransfer, eoscMultisigPropose, eoscMultisigApprove, eoscMultisigExec } from "./src/utils";
import { Transaction, Action } from "./src/interfaces";
import config from "./eosn-torch.config.json";
import members from "./eosn-torch.members.json";

(async () => {
    // Globla Configs
    let delaySec = 0;
    const delaySecInterval = config.delaySec;
    const {filename, quantity, contract, proposer, executor, expiration, proposalName} = config;
    const permission = "@active";

    let transaction: Transaction | null = null;
    const actions: Action[] = [];
    const names = new Set();

    // Write Transactions to `actions/*.json`
    let index = 0;
    for (const currentMember of members) {
        // Skip first transaction
        const previousMember = members[index - 1];
        index += 1;
        if (!previousMember) continue;

        // Transaction Configs
        const from = previousMember.account;
        const to = currentMember.account;
        const proposalName = from;
        const memo = previousMember.memo;

        // Filepaths
        const filepaths = getFilepaths(from);

        // Transfer
        await eoscTransfer(from, to, quantity, memo, {expiration, contract, delaySec, writeTransaction: filepaths.transfer})
        const transfer = load.sync<Transaction>(filepaths.transfer);
        console.log(transfer.actions);

        // MSIG Propose
        const request =  `${from}${permission}`
        await eoscMultisigPropose(proposer, proposalName, filepaths.transfer, request, {expiration, writeTransaction: filepaths.propose})
        const propose = load.sync<Transaction>(filepaths.propose);
        console.log(propose.actions);

        // MSIG Approve
        const approver = request;
        await eoscMultisigApprove(proposer, proposalName, approver, {expiration, writeTransaction: filepaths.approve})
        const approve = load.sync<Transaction>(filepaths.approve);
        console.log(approve.actions);

        // MSIG Exec
        await eoscMultisigExec(proposer, proposalName, executor, {expiration, writeTransaction: filepaths.exec})
        const exec = load.sync<Transaction>(filepaths.exec);
        console.log(exec.actions);

        // Increase Delay for next transaction
        delaySec += delaySecInterval;

        // Add Actions
        if (!transaction) transaction = exec
        actions.push(propose.actions[0])
        actions.push(approve.actions[0])
        actions.push(exec.actions[0])
        names.add(from);
    }
    if (transaction) {
        transaction.actions = actions;
        const filepath = path.join(__dirname, filename);
        write.sync(filepath, transaction);
        console.log(`eosc multisig propose ${proposer} ${proposalName} ${filename} --request ${Array.from(names).join(",")}`)
    }

})().catch(e => console.error(e));

function getFilepaths(from: string) {
    const transfer = path.join(__dirname, "actions", `${from}-transfer.json`);
    const propose = path.join(__dirname, "actions", `${from}-msig-propose.json`);
    const approve = path.join(__dirname, "actions", `${from}-msig-approve.json`);
    const exec = path.join(__dirname, "actions", `${from}-msig-exec.json`);

    return {transfer, propose, approve, exec};
}