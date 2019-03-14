import * as load from "load-json-file";
import * as write from "write-json-file";
import * as path from "path";
import { eoscTransfer, eoscMultisigPropose, eoscMultisigApprove, eoscMultisigExec } from "./src/utils";
import { Transaction, Action } from "./src/interfaces";
import members from "./members.json";

(async () => {
    let delaySec = 0;
    const delayInterval = 60 * 5; // 5 minutes
    const proposer = "eosnationftw";
    const executor = "eosnationftw";
    let transaction: Transaction | null = null;
    const actions: Action[] = [];
    const names = new Set();

    // Write Transactions to `actions/*.json`
    let index = 0;
    for (const currentMember of members) {
        const previousMember = members[index - 1];
        index += 1;
        if (!previousMember) continue;

        const from = previousMember.account;
        const to = currentMember.account;
        const proposalName = from;
        const memo = `EOSN 🔥 ${previousMember.memo}`;

        // Filepaths
        const filepaths = getFilepaths(from);

        // Transfer
        await eoscTransfer(from, to, "1 CHROT", memo, {delaySec, writeTransaction: filepaths.transfer})
        const transfer = load.sync<Transaction>(filepaths.transfer);
        console.log(transfer.actions);

        // MSIG Propose
        const request =  `${from}@active`
        await eoscMultisigPropose(proposer, proposalName, filepaths.transfer, request, {writeTransaction: filepaths.propose})
        const propose = load.sync<Transaction>(filepaths.propose);
        console.log(propose.actions);

        // MSIG Approve
        const approver = request;
        await eoscMultisigApprove(proposer, proposalName, approver, {writeTransaction: filepaths.approve})
        const approve = load.sync<Transaction>(filepaths.approve);
        console.log(approve.actions);

        // MSIG Exec
        await eoscMultisigExec(proposer, proposalName, executor, {writeTransaction: filepaths.exec})
        const exec = load.sync<Transaction>(filepaths.exec);
        console.log(exec.actions);

        // Increase Delay for next transaction
        delaySec += delayInterval;

        // Add Actions
        if (!transaction) transaction = exec
        actions.push(propose.actions[0])
        actions.push(approve.actions[0])
        actions.push(exec.actions[0])
        names.add(from);
    }
    if (transaction) {
        transaction.actions = actions;
        const filepath = path.join(__dirname, `eosn-torch.json`);
        write.sync(filepath, transaction);
        console.log(`eosc multisig propose ${proposer} torch eosn-torch.json --request ${Array.from(names).join(",")}`)
    }

})().catch(e => console.error(e));

function getFilepaths(from: string) {
    const transfer = path.join(__dirname, "actions", `${from}-transfer.json`);
    const propose = path.join(__dirname, "actions", `${from}-msig-propose.json`);
    const approve = path.join(__dirname, "actions", `${from}-msig-approve.json`);
    const exec = path.join(__dirname, "actions", `${from}-msig-exec.json`);

    return {transfer, propose, approve, exec};
}