var exports = {};
const fs = require('fs');
const path = require('path');
const THREE = require('three');
const gui = require("nw.gui");

const __dirname = process.cwd();

const effekseer_WasmUrl = `../_effekseer/effekseer.wasm`;

const server_url = `https://synrec-auth.fly.dev/`;

async function ExecuteAccountLogout() {
    await fetch(`${server_url}masterEditorLogout`,
        {
            method: "GET",
            headers: {
                "authorization": "synrec"
            }
        }
    );
    GenerateAccountInfo();
}

function GenerateAccountInfo() {
    const account_div = document.getElementById(`account-info`);
    account_div.innerHTML = "";
    account_div.textContent = "LOADING ACCOUNT INFORMATION..."
    if (account_div) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${server_url}pingLogin`);
        xhr.setRequestHeader("authorization", "synrec");
        xhr.setRequestHeader("Access-Control-Allow-Credentials", "https://synrec-auth.fly.dev/");
        xhr.withCredentials = true;
        xhr.onloadend = function () {
            account_div.textContent = "";
            const response = xhr.responseText;
            const account_info_div = document.getElementById('account-info');
            const account_bar = document.createElement("div");
            account_bar.id = `account-bar`;
            account_info_div.appendChild(account_bar);
            if (xhr.status == 200) {
                const account_info = JSON.parse(response);
                const user_name = account_info.name || "";
                const user_email = account_info.email;
                const user_balance = account_info.available_cents;
                const user_verified = account_info.email_verified;
                const user_abnormal = account_info.abnormal_state;
                const user_abnormalities = account_info.abnormal_notes;
                const account_info_block = document.createElement("div");
                account_info_block.id = 'account-mini-info';
                account_bar.appendChild(account_info_block);
                const account_name_div = document.createElement("div");
                account_name_div.id = 'account-name';
                account_info_block.appendChild(account_name_div);
                const account_name_icon = document.createElement("i");
                account_name_icon.id = "account-name-icon";
                account_name_icon.class = "";
                account_name_div.appendChild(account_name_icon);
                const account_name_text = document.createElement("p");
                account_name_text.id = "account-name-text";
                account_name_text.textContent = `Hello ${user_name} (${user_email})`;
                account_name_div.appendChild(account_name_text);
                const credits_div = document.createElement("div");
                credits_div.id = "credits-div";
                account_info_block.appendChild(credits_div);
                const credits_icon = document.createElement("i");
                credits_icon.id = "credits-icon";
                credits_icon.class = "";
                credits_div.appendChild(credits_icon);
                const credits_text = document.createElement("p");
                credits_text.id = "credits-text";
                credits_text.textContent = `Your Credit Balance Is: ${user_balance}`;
                credits_div.appendChild(credits_text);
                const mini_command_div = document.createElement("div");
                mini_command_div.id = "account-mini-command";
                account_bar.appendChild(mini_command_div);
                const full_account_div = document.createElement("div");
                full_account_div.id = 'full-account-div';
                mini_command_div.appendChild(full_account_div);
                const full_account_button = document.createElement('button');
                full_account_button.id = 'full-account-button';
                full_account_button.textContent = "ACCOUNT";
                full_account_button.onclick = function () {
                    window.location.href = `/app/home/account/account.html`;
                }
                full_account_div.appendChild(full_account_button);
                const store_div = document.createElement("div");
                store_div.id = "synrec-store-div"
                mini_command_div.appendChild(store_div);
                const store_button = document.createElement("button");
                store_button.id = `synrec-store-button`;
                store_button.textContent = `STORE`;
                store_button.onclick = function () {
                    alert(`Local Store Not Available Yet!`);
                    window.open(`https://synrec.itch.io`, 'blank');
                }
                store_div.appendChild(store_button);
                const logout_div = document.createElement("div");
                logout_div.id = "logout-div";
                mini_command_div.appendChild(logout_div);
                const logout_button = document.createElement("button");
                logout_button.id = "logout-button";
                logout_button.textContent = "LOGOUT";
                logout_button.onclick = function () {
                    ExecuteAccountLogout();
                }
                logout_div.appendChild(logout_button);
            } else {
                const login_div = document.createElement("div");
                login_div.id = "login-div";
                account_bar.appendChild(login_div);
                const login_text = document.createElement("button");
                login_text.id = "login-button";
                login_text.textContent = "LOGIN";
                login_text.onclick = function () {
                    window.location.href = `/app/home/account/account.html`;
                }
                login_div.appendChild(login_text);
            }
        }
        xhr.send();
    }
}

function GetAccountInfo() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${server_url}accountInformation`);
    xhr.setRequestHeader("authorization", "synrec");
    xhr.withCredentials = true;
    xhr.onloadend = function () {
        const response = xhr.responseText;
        console.log(response);
    }
    xhr.send();
}

function DoPatreonLogin() {
    window.open(`${server_url}loginPatreon`, 'blank');
}

function GetEditorVersion() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${server_url}masterEditorVersion`);
    xhr.onloadend = function () {
        const response = xhr.responseText;
        if (response) {
            document.title = `Synrec Master Editor ${response}`;
        }
    }
    xhr.send();
}

function InvalidSynrecPlugins() {
    return [
        "Synrec_Master_Editor.js",
    ]
}

function IgnoredPlugins() {
    /**
     * This follows the same format as "InvalidSynrecPlugins"
     * 
     * This is to be used for non-Synrec plugins.
     */
    return [];
}

function IsInvalidPlugin(name) {
    const array_chk = InvalidSynrecPlugins().concat(IgnoredPlugins());
    return array_chk.includes(name);
}