const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { Tween } = require('three/examples/jsm/libs/tween.module.js');
const gui = require("nw.gui");

const __dirname = process.cwd();

class EditorAccount {
    constructor() {
        this._logged_in = false;
        this._connection_retries = 3;
        this._connect_code = null;
        this._server_url = `https://synrec-auth.fly.dev/`;
        this.openConnection();
    }

    serverUrl() {
        return this._server_url || "https://synrec.dev/";
    }

    openConnection() {
        const socket = this._connection_socket;
        // socket.open();
    }

    closeConnection() {
        const socket = this._connection_socket;
        // socket.close();
    }

    pingServer() {
        const socket = this._connection_socket;
        socket.send
    }

    async checkLogin() {
        const url = `${this.serverUrl()}checkLogin`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "authorization": "synrec",
                "Access-Control-Allow-Credentials": "https://synrec-auth.fly.dev/"
            },
            credentials: 'include'
        }).then(async (result) => {
            const true_result = await result.json();
        })
    }

    async checkLink() {
        const url = `${this.serverUrl()}checkLink`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "authorization": "synrec",
                "Access-Control-Allow-Credentials": "https://synrec-auth.fly.dev/"
            },
            credentials: 'include'
        }).then(async (result) => {
            const true_result = await result.json();
            console.log(true_result)
        })
    }

    async account() {
        const url = `${this.serverUrl()}accountInformation`;
        const data = await fetch(url, {
            method: "GET",
            headers: {
                "authorization": "synrec",
                "Access-Control-Allow-Credentials": "https://synrec-auth.fly.dev/"
            },
            credentials: 'include'
        });
        if (data.status != 200) {
            await this.checkLogin();
            return;
        }
        try {
            const account = await data.json();
            console.log(account);
            return account;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    loginGoogle() { }

    loginPatreon() { }
}

function CreateThreeParticleBackground(canvas) {
    let G = 6.5;
    let escapeVelocity = 0.35;
    let maxDistance = 12;
    let mouseInfluenceRadius = 6;
    let waveAmplitude = 2.0;
    let colorCycleSpeed = 0.02;
    let trailEffect = 0.95;
    let time = 0;
    let mat;
    const damping = 0.985;
    const dt = 0.016;
    const particleCount = 15000;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.01);
    scene.background = new THREE.Color(0x000000)
    const ww = window.innerHeight;
    const wh = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(35, ww / wh, 1, 1000);
    camera.position.set(0, 0, 10);
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(ww, wh);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.domElement.id = "three-canvas";
    canvas.appendChild(renderer.domElement);

    let _ambientLights;
    function createLights() {
        _ambientLights = new THREE.HemisphereLight(0xffffff, 0x000000, 1.4);
        scene.add(_ambientLights);
    }

    let uniforms = {
        time: {
            type: "f",
            value: 1.0
        },
        pointscale: {
            type: "f",
            value: 1.0
        },
        decay: {
            type: "f",
            value: 2.0
        },
        complex: {
            type: "f",
            value: 2.0
        },
        waves: {
            type: "f",
            value: 3.0
        },
        eqcolor: {
            type: "f",
            value: 3.0
        },
        fragment: {
            type: 'i',
            value: false
        },
        dnoise: {
            type: 'f',
            value: 0.0
        },
        qnoise: {
            type: 'f',
            value: 4.0
        },
        r_color: {
            type: 'f',
            value: 0.0
        },
        g_color: {
            type: 'f',
            value: 0.0
        },
        b_color: {
            type: 'f',
            value: 0.0
        }
    }

    let speedRandom = Math.random(10) / 10000;

    let options = {
        perlin: {
            vel: 0.002,
            speed: speedRandom,
            perlins: 1.0,
            decay: 0.40,
            complex: 0.0,
            waves: 10.0,
            eqcolor: 11.0,
            fragment: false,
            redhell: true
        },
        rgb: {
            r_color: 6.0,
            g_color: 0.0,
            b_color: 0.2
        },
        cam: {
            zoom: 10
        }
    }

    let primitiveElement = function () {
        this.mesh = new THREE.Object3D();
        let geo = new THREE.IcosahedronGeometry(1, 6);
        mat = new THREE.ShaderMaterial({
            wireframe: false,
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        })
        let mesh = new THREE.Mesh(geo, mat);
        this.mesh.add(mesh);
        return mesh;
    }

    let _primitive;
    function createPrimitive() {
        _primitive = new primitiveElement();
        // _primitive.mesh.scale.set(1, 1, 1);
        _primitive.scale.set(1, 1, 1);
        scene.add(_primitive);
    }
    createPrimitive();
    function createGrid() {
        var gridHelper = new THREE.GridHelper(20, 20);
        gridHelper.position.y = -1;
        scene.add(gridHelper);
    }

    let start = Date.now();
    function animate() {
        try {
            let time = Date.now() * 0.003;
            // Tween.to(camera.position, 1, { z: options.cam.zoom + 5 });
            // _primitive.mesh.rotation.y += 0.001;
            _primitive.rotation.y += 0.001;
            mat.uniforms['time'].value = options.perlin.speed * (Date.now() - start);
            mat.uniforms['pointscale'].value = options.perlin.perlins;
            mat.uniforms['decay'].value = options.perlin.decay;
            mat.uniforms['complex'].value = options.perlin.complex;
            mat.uniforms['waves'].value = options.perlin.waves;
            mat.uniforms['eqcolor'].value = options.perlin.eqcolor;
            mat.uniforms['r_color'].value = options.rgb.r_color;
            mat.uniforms['g_color'].value = options.rgb.g_color;
            mat.uniforms['b_color'].value = options.rgb.b_color;
            mat.uniforms['fragment'].value = options.perlin.fragment;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        } catch (e) {
            console.error(e);
        }
    }
    animate();
    function onWindowResize() {
        const ww = window.innerHeight;
        const wh = window.innerHeight;
        camera.aspect = ww / wh;
        camera.updateProjectionMatrix();
        renderer.setSize(ww, wh);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();
}

function IsValidAccount(account) {
    if (!account) return false;
    const patreon = !!account.patreon_connected;
    const itchio = !!account.itchio_connected;
    const discord = !!account.discord_connected;
    const tumblr = !!account.tumblr_connected;
    const google = !!account.google_connected;
    return (
        patreon ||
        itchio ||
        discord ||
        tumblr ||
        google
    );
}

async function CreatePageFooter() {
    const acc_container_div = document.getElementById("account-container");
    const home_btn_div = document.createElement("div");
    home_btn_div.id = "home-button-div";
    acc_container_div.appendChild(home_btn_div);
    const home_btn = document.createElement("button");
    home_btn.id = "home-button";
    home_btn.onclick = function () {
        GoToHome();
    }
    home_btn.textContent = "HOME";
    home_btn_div.appendChild(home_btn);
    const footer_div = document.createElement("div");
    footer_div.className = "site-footer";
    acc_container_div.appendChild(footer_div);
    const fiverr_link = document.createElement("a");
    fiverr_link.href = `https://www.fiverr.com/kylestclair/`;
    fiverr_link.className = "fiverr";
    footer_div.appendChild(fiverr_link);
    const fiverr_icon = document.createElement("i");
    fiverr_icon.className = "fa-brands fa-facebook";
    fiverr_link.appendChild(fiverr_icon);
    const github_link = document.createElement("a");
    github_link.href = `https://github.com/Synrec`;
    github_link.className = "github";
    footer_div.appendChild(github_link);
    const github_icon = document.createElement("i");
    github_icon.className = "fa-brands fa-github";
    github_link.appendChild(github_icon);
    const youtube_link = document.createElement("a");
    youtube_link.href = `https://www.youtube.com/@Onidrako`;
    youtube_link.className = "youtube";
    footer_div.appendChild(youtube_link);
    const youtube_icon = document.createElement("i");
    youtube_icon.className = "fa-brands fa-youtube";
    youtube_link.appendChild(youtube_icon);
    const discord_link = document.createElement("a");
    discord_link.href = `https://discord.gg/FZUqZGuvFH`;
    discord_link.className = "discord";
    footer_div.appendChild(discord_link);
    const discord_icon = document.createElement("i");
    discord_icon.className = "fa-brands fa-discord";
    discord_link.appendChild(discord_icon);
}

async function CreateAccountPage() {
    if (!this._has_canvas_3d) {
        CreateThreeParticleBackground(document.body);
        this._has_canvas_3d = true;
    }
    const acc_container_div = document.getElementById("account-container");
    acc_container_div.innerHTML = "";
    const account = await editor_account.account();
    if (IsValidAccount(account)) {
        const url = `https://synrec-auth.fly.dev/resetPatreonPledge`;
        await fetch(url);
        CreateAccountInfoPage(account);
        CreateItchProductLink(account);
    } else {
        CreateAccountLoginPage();
    }
    CreatePageFooter();
}

async function CreateAccountInfoPage(account) {
    const acc_container_div = document.getElementById("account-container");
    acc_container_div.innerHTML = "";
    const profile_header_div = document.createElement("div");
    profile_header_div.id = "profile-header-div";
    profile_header_div.textContent = "PROFILE";
    acc_container_div.appendChild(profile_header_div);
    const profile_info_div = document.createElement("div");
    profile_info_div.id = "profile-info-div";
    acc_container_div.appendChild(profile_info_div);
    const linked_accounts_div = document.createElement("div");
    linked_accounts_div.id = "linked-accounts-div";
    profile_info_div.appendChild(linked_accounts_div);
    const linked_accounts_header = document.createElement("div");
    linked_accounts_header.id = "linked-accounts-header";
    linked_accounts_header.textContent = "Linked Accounts";
    linked_accounts_div.appendChild(linked_accounts_header);
    const linked_accounts_area = document.createElement("div");
    linked_accounts_area.id = "linked-accounts-area";
    linked_accounts_div.appendChild(linked_accounts_area);
    CreateLinkedAccountsList(linked_accounts_area, account);
    const credits_history_div = document.createElement("div");
    credits_history_div.id = "credits-history-div";
    credits_history_div.textContent = "No Credits History";
    profile_info_div.appendChild(credits_history_div);
}

function CreateLinkedAccountsList(area_div, account) {
    const patreon_connected = account.patreon_connected ? "Connected" : "Disconnected";
    const itchio_connected = account.itchio_connected ? "Connected" : "Disconnected";
    const discord_connected = account.discord_connected ? "Connected" : "Disconnected";
    const tumblr_connected = account.tumblr_connected ? "Connected" : "Disconnected";
    const google_connected = account.google_connected ? "Connected" : "Disconnected";
    const patreon_link_div = document.createElement("div");
    patreon_link_div.id = "account-link-div";
    area_div.appendChild(patreon_link_div);
    const patreon_icon = document.createElement("i");
    patreon_icon.id = "account-link-icon";
    patreon_icon.className = "fa-brands fa-patreon";
    patreon_link_div.appendChild(patreon_icon);
    const patreon_connected_text = document.createElement("p");
    patreon_connected_text.id = "account-connected-text";
    patreon_connected_text.textContent = patreon_connected;
    patreon_link_div.appendChild(patreon_connected_text);
    if (patreon_connected != "Connected") {
        const connect_button = document.createElement('button');
        connect_button.id = "account-connect-button";
        connect_button.onclick = function () {
            StartPatreonConnect();
        }
        patreon_link_div.appendChild(connect_button);
        const connect_icon = document.createElement("i");
        connect_icon.className = "fa-solid fa-plug";
        connect_button.appendChild(connect_icon);
    } else {
        patreon_connected_text.style.color = "#00ff00";
    }
    const itchio_link_div = document.createElement("div");
    itchio_link_div.id = "account-link-div";
    area_div.appendChild(itchio_link_div);
    const itchio_icon = document.createElement("i");
    itchio_icon.id = "account-link-icon";
    itchio_icon.className = "fa-brands fa-itch-io";
    itchio_link_div.appendChild(itchio_icon);
    const itchio_connected_text = document.createElement("p");
    itchio_connected_text.id = "account-connected-text";
    itchio_connected_text.textContent = itchio_connected;
    itchio_link_div.appendChild(itchio_connected_text);
    if (itchio_connected != "Connected") {
        const connect_button = document.createElement('button');
        connect_button.id = "account-connect-button";
        connect_button.onclick = function () {
            StartItchioConnect();
        }
        itchio_link_div.appendChild(connect_button);
        const connect_icon = document.createElement("i");
        connect_icon.className = "fa-solid fa-plug";
        connect_button.appendChild(connect_icon);
    } else {
        itchio_connected_text.style.color = "#00ff00";
    }
    const discord_link_div = document.createElement("div");
    discord_link_div.id = "account-link-div";
    area_div.appendChild(discord_link_div);
    const discord_icon = document.createElement("i");
    discord_icon.id = "account-link-icon";
    discord_icon.className = "fa-brands fa-discord";
    discord_link_div.appendChild(discord_icon);
    const discord_connected_text = document.createElement("p");
    discord_connected_text.id = "account-connected-text";
    discord_connected_text.textContent = discord_connected;
    discord_link_div.appendChild(discord_connected_text);
    if (discord_connected != "Connected") {
        const connect_button = document.createElement('button');
        connect_button.id = "account-connect-button";
        connect_button.onclick = function () {
            StartDiscordConnect();
        }
        discord_link_div.appendChild(connect_button);
        const connect_icon = document.createElement("i");
        connect_icon.className = "fa-solid fa-plug";
        connect_button.appendChild(connect_icon);
    } else {
        discord_connected_text.style.color = "#00ff00";
    }
    const tumblr_link_div = document.createElement("div");
    tumblr_link_div.id = "account-link-div";
    area_div.appendChild(tumblr_link_div);
    const tumblr_icon = document.createElement("i");
    tumblr_icon.id = "account-link-icon";
    tumblr_icon.className = "fa-brands fa-tumblr";
    tumblr_link_div.appendChild(tumblr_icon);
    const tumblr_connected_text = document.createElement("p");
    tumblr_connected_text.id = "account-connected-text";
    tumblr_connected_text.textContent = tumblr_connected;
    tumblr_link_div.appendChild(tumblr_connected_text);
    if (tumblr_connected != "Connected") {
        const connect_button = document.createElement('button');
        connect_button.id = "account-connect-button";
        connect_button.onclick = function () {
            StartTumblrConnect();
        }
        tumblr_link_div.appendChild(connect_button);
        const connect_icon = document.createElement("i");
        connect_icon.className = "fa-solid fa-plug";
        connect_button.appendChild(connect_icon);
    } else {
        tumblr_connected_text.style.color = "#00ff00";
    }
    const google_link_div = document.createElement("div");
    google_link_div.id = "account-link-div";
    area_div.appendChild(google_link_div);
    const google_icon = document.createElement("i");
    google_icon.id = "account-link-icon";
    google_icon.className = "fa-brands fa-google";
    google_link_div.appendChild(google_icon);
    const google_connected_text = document.createElement("p");
    google_connected_text.id = "account-connected-text";
    google_connected_text.textContent = google_connected;
    google_link_div.appendChild(google_connected_text);
    if (google_connected != "Connected") {
        const connect_button = document.createElement('button');
        connect_button.id = "account-connect-button";
        connect_button.onclick = function () {
            StartGoogleConnect();
        }
        google_link_div.appendChild(connect_button);
        const connect_icon = document.createElement("i");
        connect_icon.className = "fa-solid fa-plug";
        connect_button.appendChild(connect_icon);
    } else {
        google_connected_text.style.color = "#00ff00";
    }
}

async function StartPatreonConnect() {
    DoPatreonLogin(true);
}

async function StartItchioConnect() {
    DoItchioLogin(true);
}

async function StartDiscordConnect() {
    DoDiscordLogin(true);
}

async function StartTumblrConnect() {
    DoTumblrLogin(true);
}

async function StartGoogleConnect() {
    DoGoogleLogin(true);
}

async function CheckConnectionLogin() {
    const account = await editor_account.account();
    if (!account) {
        setTimeout(CheckConnectionLogin, 1000);
        return;
    }
    const mode = this._check_mode;
    const type = this._log_type;
    if (mode && !type) {
        this._check_mode = null;
        this._log_type = null;
    }
    if (!mode && type) {
        this._check_mode = null;
        this._log_type = null;
    }
    console.log(account, typeof account);
    switch (mode) {
        case 'patreon':
            if (type == 'login') {
                if (!!account.patreon_connected) {
                    this._check_mode = null;
                    this._log_type = null;
                    CreateAccountPage();
                } else {
                    await editor_account.checkLink();
                }
            } else if (type == 'logout') {
                if (!account.patreon_connected) {
                    this._check_mode = null;
                    this._log_type = null;
                    CreateAccountPage();
                }
            }
            break;
        case 'itchio':
            if (type == 'login') {
                if (!!account.itchio_connected) {
                    this._check_mode = null;
                    this._log_type = null;
                    CreateAccountPage();
                } else {
                    await editor_account.checkLink();
                }
            } else if (type == 'logout') {
                if (!account.itchio_connected) {
                    this._check_mode = null;
                    this._log_type = null;
                    CreateAccountPage();
                }
            }
            break;
        case 'discord':
            if (type == 'login') {
                if (!!account.discord_connected) {
                    this._check_mode = null;
                    this._log_type = null;
                    CreateAccountPage();
                } else {
                    await editor_account.checkLink();
                }
            } else if (type == 'logout') {
                if (!account.discord_connected) {
                    this._check_mode = null;
                    this._log_type = null;
                    CreateAccountPage();
                }
            }
            break;
        case 'tumblr':
            if (type == 'login') {
                if (!!account.tumblr_connected) {
                    this._check_mode = null;
                    this._log_type = null;
                    CreateAccountPage();
                } else {
                    await editor_account.checkLink();
                }
            } else if (type == 'logout') {
                if (!account.tumblr_connected) {
                    this._check_mode = null;
                    this._log_type = null;
                    CreateAccountPage();
                }
            }
            break;
        case 'google':
            if (type == 'login') {
                if (!!account.google_connected) {
                    this._check_mode = null;
                    this._log_type = null;
                    CreateAccountPage();
                } else {
                    await editor_account.checkLink();
                }
            } else if (type == 'logout') {
                if (!account.google_connected) {
                    this._check_mode = null;
                    this._log_type = null;
                    CreateAccountPage();
                }
            }
            break;
    }
    if (this._check_mode || this._log_type) {
        setTimeout(CheckConnectionLogin, 1000);
    }
}

async function DoPatreonLogin() {
    const url = `https://synrec-auth.fly.dev/loginPatreon`;
    await fetch(`${url}?nw=true`)
        .then((result) => {
            if (result.status == 200) {
                nw.Shell.openExternal(url);
                window._check_mode = "patreon";
                window._log_type = 'login';
                CheckConnectionLogin();
            } else {
                throw new Error("Failed to set connection data.");
            }
        })
        .catch((error) => {
            console.error(error);
        })
    // nw.Window.open(`${url}?nw=true`);
    // nw.Window.open(`https://synrec-auth.fly.dev/loginPatreon`);
}

async function EndPatreonConnect() {
    await fetch(`https://synrec-auth.fly.dev/logoutPatreon`, {
        method: "GET",
        headers: {
            'authorization': 'synrec'
        },
        credentials: 'include'
    })
    CreateAccountPage();
}

async function DoItchioLogin() {
    const url = `https://synrec-auth.fly.dev/loginItchio`;
    await fetch(`${url}?nw=true`)
        .then((result) => {
            if (result.status == 200) {
                nw.Shell.openExternal(url);
                window._check_mode = "itchio";
                window._log_type = 'login';
                CheckConnectionLogin();
            } else {
                throw new Error("Failed to set connection data.");
            }
        })
        .catch((error) => {
            console.error(error);
        })
}

async function EndItchioConnect() {
    await fetch(`https://synrec-auth.fly.dev/logoutItchio`, {
        method: "GET",
        headers: {
            'authorization': 'synrec'
        },
        credentials: 'include'
    })
    CreateAccountPage();
}

async function DoDiscordLogin() {
    const url = `https://synrec-auth.fly.dev/loginDiscord`;
    await fetch(`${url}?nw=true`)
        .then((result) => {
            if (result.status == 200) {
                nw.Shell.openExternal(url);
                window._check_mode = "discord";
                window._log_type = 'login';
                CheckConnectionLogin();
            } else {
                throw new Error("Failed to set connection data.");
            }
        })
        .catch((error) => {
            console.error(error);
        })
}

async function EndDiscordConnect() {
    await fetch(`https://synrec-auth.fly.dev/logoutDiscord`, {
        method: "GET",
        headers: {
            'authorization': 'synrec'
        },
        credentials: 'include'
    })
    CreateAccountPage();
}

async function DoTumblrLogin() {
    const url = `https://synrec-auth.fly.dev/loginTumblr`;
    await fetch(`${url}?nw=true`)
        .then((result) => {
            if (result.status == 200) {
                nw.Shell.openExternal(url);
                window._check_mode = "tumblr";
                window._log_type = 'login';
                CheckConnectionLogin();
            } else {
                throw new Error("Failed to set connection data.");
            }
        })
        .catch((error) => {
            console.error(error);
        })
}

async function EndTumblrConnect() {
    await fetch(`https://synrec-auth.fly.dev/logoutTumblr`, {
        method: "GET",
        headers: {
            'authorization': 'synrec'
        },
        credentials: 'include'
    })
    CreateAccountPage();
}

async function DoGoogleLogin() {
    const url = `https://synrec-auth.fly.dev/loginGoogle`;
    await fetch(`${url}?nw=true`)
        .then((result) => {
            if (result.status == 200) {
                nw.Shell.openExternal(url);
                window._check_mode = "google";
                window._log_type = 'login';
                CheckConnectionLogin();
            } else {
                throw new Error("Failed to set connection data.");
            }
        })
        .catch((error) => {
            console.error(error);
        })
    // nw.Window.open(`${url}?nw=true`);
    // nw.Window.open(`https://synrec-auth.fly.dev/loginGoogle`);
}

async function EndGoogleConnect() {
    await fetch(`https://synrec-auth.fly.dev/logoutGoogle`, {
        method: "GET",
        headers: {
            'authorization': 'synrec'
        },
        credentials: 'include'
    })
    CreateAccountPage();
}

function CreateItchProductLink(account) {
    const acc_container_div = document.getElementById("account-container");
    const itch_products_div = document.createElement("div");
    itch_products_div.id = "itch-products-div";
    acc_container_div.appendChild(itch_products_div);
    const itch_search_div = document.createElement("div");
    itch_search_div.id = "itch-search-div";
    itch_products_div.appendChild(itch_search_div);
    const itch_products_search = document.createElement("input");
    itch_products_search.id = "itch-products-search";
    itch_products_search.textContent = "SEARCH";
    itch_search_div.appendChild(itch_products_search);
    const itch_products_block = document.createElement("div");
    itch_products_block.id = "itch-products-block";
    itch_products_div.appendChild(itch_products_block);
    const itch_tag_filters = document.createElement("div");
    itch_tag_filters.id = "itch-tag-filters";
    itch_products_block.appendChild(itch_tag_filters);
    CreateItchIoFilterList(itch_tag_filters);
    const itch_products_list = document.createElement("div");
    itch_products_list.id = "itch-products-list";
    itch_products_block.appendChild(itch_products_list);
    CreateItchIoProductsList(itch_products_list);
    itch_products_search.oninput = function () {
        CreateItchIoProductsList(itch_products_list);
    }
}

async function CreateItchIoFilterList(container) {
    const url = `https://synrec-auth.fly.dev/getItchTags`;
    const filter_list_res = await fetch(url);
    const filter_list_data = await filter_list_res.json();
}

async function CreateItchIoProductsList(container) {
    const url = `https://synrec-auth.fly.dev/getItchProducts`;
    const product_list_res = await fetch(url);
    const product_list_data = await product_list_res.json();
}

function CreateAccountLoginPage() {
    const acc_container_div = document.getElementById("account-container");
    const login_container = document.createElement("div");
    login_container.id = "login-container";
    acc_container_div.appendChild(login_container);
    const login_exp_div = document.createElement("div");
    login_exp_div.id = "login-explain-div";
    login_container.appendChild(login_exp_div);
    const login_explain_text = document.createElement("p");
    login_explain_text.textContent = "Select An Option Below To Login!";
    login_exp_div.appendChild(login_explain_text);
    const login_div = document.createElement("div");
    login_div.id = "login-div";
    login_container.appendChild(login_div);
    const patreon_login_div = document.createElement("div");
    patreon_login_div.id = "patreon-login-div";
    login_div.appendChild(patreon_login_div);
    const patreon_login_btn = document.createElement("button");
    patreon_login_btn.id = "login-button";
    patreon_login_btn.textContent = "PATREON";
    patreon_login_btn.onclick = function () {
        DoPatreonLogin();
    }
    patreon_login_div.appendChild(patreon_login_btn);
    const patreon_icon = document.createElement('i');
    patreon_icon.className = "fa-brands fa-patreon";
    patreon_login_btn.appendChild(patreon_icon);
    const itchio_login_div = document.createElement("div");
    itchio_login_div.id = "itchio-login-div";
    login_div.appendChild(itchio_login_div);
    const itchio_login_button = document.createElement("button");
    itchio_login_button.id = "login-button";
    itchio_login_button.textContent = "ITCH IO";
    itchio_login_button.onclick = function () {
        DoItchioLogin();
    }
    itchio_login_div.appendChild(itchio_login_button);
    const itchio_icon = document.createElement('i');
    itchio_icon.className = "fa-brands fa-itch-io";
    itchio_login_button.appendChild(itchio_icon);
    const discord_login_div = document.createElement("div");
    discord_login_div.id = "discord-login-div";
    login_div.appendChild(discord_login_div);
    const discord_login_button = document.createElement("button");
    discord_login_button.id = "login-button";
    discord_login_button.textContent = "DISCORD";
    discord_login_button.onclick = function () {
        DoDiscordLogin();
    }
    discord_login_div.appendChild(discord_login_button);
    const discord_icon = document.createElement('i');
    discord_icon.className = "fa-brands fa-discord";
    discord_login_button.appendChild(discord_icon);
    const tumblr_login_div = document.createElement("div");
    tumblr_login_div.id = "tumblr-login-div";
    login_div.appendChild(tumblr_login_div);
    const tumblr_login_button = document.createElement("button");
    tumblr_login_button.id = "login-button";
    tumblr_login_button.textContent = "TUMBLR";
    tumblr_login_button.onclick = function () {
        DoTumblrLogin();
    }
    tumblr_login_div.appendChild(tumblr_login_button);
    const tumblr_icon = document.createElement('i');
    tumblr_icon.className = "fa-brands fa-tumblr";
    tumblr_login_button.appendChild(tumblr_icon);
    const google_login_div = document.createElement("div");
    google_login_div.id = "google-login-div";
    login_div.appendChild(google_login_div);
    const google_login_button = document.createElement("button");
    google_login_button.id = "login-button";
    google_login_button.textContent = "GOOGLE";
    google_login_button.onclick = function () {
        DoGoogleLogin();
    }
    google_login_div.appendChild(google_login_button);
    const google_icon = document.createElement('i');
    google_icon.className = "fa-brands fa-google";
    google_login_button.appendChild(google_icon);
}

function GoToHome() {
    window.location.href = "/app/home/home.html";
}