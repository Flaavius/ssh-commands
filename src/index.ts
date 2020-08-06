import * as core from '@actions/core';
import node_ssh from 'node-ssh';
import fs from "fs";
import { keyboardFunction } from './keyboard';

async function run() {
  const host: string = core.getInput('host') || 'localhost';
  const username: string = core.getInput('username');
  const port: number = +core.getInput('port') || 22;
  const privateKey: string = core.getInput('privateKey');
  const password: string = core.getInput('password');
  const passphrase: string = core.getInput('passphrase');
  const tryKeyboard: boolean = !!core.getInput('tryKeyboard');
  const command: string = core.getInput("command");

  try {
    const ssh = await connect(
      host,
      username,
      port,
      privateKey,
      password,
      passphrase,
      tryKeyboard
    );
    
    const result = await ssh.execCommand(command);
    console.log(result);

    ssh.dispose();
  } catch (err) {
    core.setFailed(err);
  }
}

async function connect(
  host = 'localhost',
  username: string,
  port = 22,
  privateKey: string,
  password: string,
  passphrase: string,
  tryKeyboard: boolean
) {
  const ssh = new node_ssh();
  console.log(`Establishing a SSH connection to ${host}.`);

  try {
    await ssh.connect({
      host: host,
      port: port,
      username: username,
      password: password,
      passphrase: passphrase,
      privateKey: privateKey,
      tryKeyboard: tryKeyboard,
      // @ts-ignore
      onKeyboardInteractive: tryKeyboard ? keyboardFunction(password) : null
    });
    console.log(`🤝 Connected to ${host}.`);
  } catch (err) {
    console.error(`⚠️ The GitHub Action couldn't connect to ${host}.`, err);
    core.setFailed(err.message);
  }

  return ssh;
}

run();
