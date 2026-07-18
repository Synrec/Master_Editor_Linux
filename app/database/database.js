function GET_DATABASE() {
    const base_path = process.cwd();
    const data = {};
    const data_path = `${base_path}/project/data`;
    const actors_path = `${data_path}/Actors.json`;
    const actors_data = fs.readFileSync(`${actors_path}`, 'utf8');
    data.actors = JSON.parse(actors_data);
    const armors_path = `${data_path}/Armors.json`;
    const armors_data = fs.readFileSync(`${armors_path}`, 'utf8');
    data.armors = JSON.parse(armors_data);
    const classes_path = `${data_path}/Classes.json`;
    const classes_data = fs.readFileSync(`${classes_path}`, 'utf8');
    data.classes = JSON.parse(classes_data);
    const enemies_path = `${data_path}/Enemies.json`;
    const enemies_data = fs.readFileSync(`${enemies_path}`, 'utf8');
    data.enemies = JSON.parse(enemies_data);
    const items_path = `${data_path}/Items.json`;
    const items_data = fs.readFileSync(`${items_path}`, 'utf8');
    data.items = JSON.parse(enemies_data);
    const skills_path = `${data_path}/Skills.json`;
    const skills_data = fs.readFileSync(`${skills_path}`, 'utf8');
    data.skills = JSON.parse(skills_data);
    const states_path = `${data_path}/States.json`;
    const states_data = fs.readFileSync(`${states_path}`, 'utf8');
    data.states = JSON.parse(states_data);
    const tilesets_path = `${data_path}/Tilesets.json`;
    const tilesets_data = fs.readFileSync(`${tilesets_path}`, 'utf8');
    data.tilesets = JSON.parse(tilesets_data);
    const troops_path = `${data_path}/Troops.json`;
    const troops_data = fs.readFileSync(`${troops_path}`, 'utf8');
    data.troops = JSON.parse(troops_data);
    const weapons_path = `${data_path}/Weapons.json`;
    const weapons_data = fs.readFileSync(`${weapons_path}`, 'utf8');
    data.weapons = JSON.parse(weapons_data);
    return data;
}

async function ACTORS_DATABASE() {
    if (!this._database) {
        this._database = await GET_DATABASE();
    }
    const database = this._database;
    return database.actors;
}

async function ARMORS_DATABASE() {
    if (!this._database) {
        this._database = await GET_DATABASE();
    }
    const database = this._database;
    return database.armors;
}

async function CLASSES_DATABASE() {
    if (!this._database) {
        this._database = await GET_DATABASE();
    }
    const database = this._database;
    return database.classes;
}

async function ENEMIES_DATABASE() {
    if (!this._database) {
        this._database = await GET_DATABASE();
    }
    const database = this._database;
    return database.enemies;
}

async function ITEMS_DATABASE() {
    if (!this._database) {
        this._database = await GET_DATABASE();
    }
    const database = this._database;
    return database.items;
}

async function SKILLS_DATABASE() {
    if (!this._database) {
        this._database = await GET_DATABASE();
    }
    const database = this._database;
    return database.skills;
}

async function STATES_DATABASE() {
    if (!this._database) {
        this._database = await GET_DATABASE();
    }
    const database = this._database;
    return database.states;
}

async function TILESETS_DATABASE() {
    if (!this._database) {
        this._database = await GET_DATABASE();
    }
    const database = this._database;
    return database.tilesets;
}

async function TROOPS_DATABASE() {
    if (!this._database) {
        this._database = await GET_DATABASE();
    }
    const database = this._database;
    return database.troops;
}

async function WEAPONS_DATABASE() {
    if (!this._database) {
        this._database = await GET_DATABASE();
    }
    const database = this._database;
    return database.weapons;
}

function DRAW_3D_BACKGROUND() {
    const canvas = document.body;
    let G = 6.5;
    let escapeVelocity = 0.35;
    let maxDistance = 12;
    let mouseInfluenceRadius = 6;
    let waveAmplitude = 1.0;
    let colorCycleSpeed = 0.1;
    let trailEffect = 0.95;
    let time = 0;
    let mat;
    const damping = 0.985;
    const dt = 0.016;
    const particleCount = 15000;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x00ffaa, 0.01);
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
            vel: 0.010,
            speed: speedRandom,
            perlins: 10.0,
            decay: 1.00,
            complex: 0.0,
            waves: 5.0,
            eqcolor: 10.0,
            fragment: false,
            redhell: true
        },
        rgb: {
            r_color: 5.0,
            g_color: 0.0,
            b_color: 3.2
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

function CreateDatabaseNavigator() {
    const main_div = document.getElementById("database-div");
    main_div.innerHTML = "";
    const nav_bar_div = document.createElement("div");
    nav_bar_div.id = "database-navbar-div";
    main_div.appendChild(nav_bar_div);
    const actors_btn = document.createElement("button");
    actors_btn.className = "database-nav-btn";
    actors_btn.textContent = "ACTORS";
    actors_btn.onclick = function () {
        CREATE_ACTORS_DISPLAY();
    }
    nav_bar_div.appendChild(actors_btn);
    const classes_btn = document.createElement("button");
    classes_btn.className = "database-nav-btn";
    classes_btn.textContent = "CLASSES";
    classes_btn.onclick = function () {
        CREATE_CLASSES_DISPLAY();
    }
    nav_bar_div.appendChild(classes_btn);
    const armors_btn = document.createElement("button");
    armors_btn.className = "database-nav-btn";
    armors_btn.textContent = "ARMORS";
    armors_btn.onclick = function () {
        CREATE_ARMORS_DISPLAY();
    }
    nav_bar_div.appendChild(armors_btn);
    const weapons_btn = document.createElement("button");
    weapons_btn.className = "database-nav-btn";
    weapons_btn.textContent = "WEAPONS";
    weapons_btn.onclick = function () {
        CREATE_WEAPONS_DISPLAY();
    }
    nav_bar_div.appendChild(weapons_btn);
    const items_btn = document.createElement("button");
    items_btn.className = "database-nav-btn";
    items_btn.textContent = "ITEMS";
    items_btn.onclick = function () {
        CREATE_ITEMS_DISPLAY();
    }
    nav_bar_div.appendChild(items_btn);
    const skills_btn = document.createElement("button");
    skills_btn.className = "database-nav-btn";
    skills_btn.textContent = "SKILLS";
    skills_btn.onclick = function () {
        CREATE_SKILLS_DISPLAY();
    }
    nav_bar_div.appendChild(skills_btn);
    const states_btn = document.createElement("button");
    states_btn.className = "database-nav-btn";
    states_btn.textContent = "STATES";
    states_btn.onclick = function () {
        CREATE_STATES_DISPLAY();
    }
    nav_bar_div.appendChild(states_btn);
    const enemies_btn = document.createElement("button");
    enemies_btn.className = "database-nav-btn";
    enemies_btn.textContent = "ENEMIES";
    enemies_btn.onclick = function () {
        CREATE_ENEMIES_DISPLAY();
    }
    nav_bar_div.appendChild(enemies_btn);
    const troops_btn = document.createElement("button");
    troops_btn.className = "database-nav-btn";
    troops_btn.textContent = "TROOPS";
    troops_btn.onclick = function () {
        CREATE_TROOPS_DISPLAY();
    }
    nav_bar_div.appendChild(troops_btn);
    const tilesets_btn = document.createElement("button");
    tilesets_btn.className = "database-nav-btn";
    tilesets_btn.textContent = "TILESETS";
    tilesets_btn.onclick = function () {
        CREATE_TROOPS_DISPLAY();
    }
    nav_bar_div.appendChild(tilesets_btn);
}

async function CreateDatabaseDisplay() {
    const main_div = document.getElementById("database-div");
    const database_display = document.createElement("div");
    database_display.id = "database-display-div";
    main_div.appendChild(database_display);
}

async function DrawActorData(btn_elem, data) {
    const class_database = await CLASSES_DATABASE();
    const weapon_database = await WEAPONS_DATABASE();
    const armor_database = await ARMORS_DATABASE();
    const data_display = document.getElementById("database-data-display");
    const id = data.id;
    const name = data.name;
    const nickname = data.nickname;
    const initial_level = data.initialLevel;
    const max_level = data.maxLevel;
    const class_id = data.classId;
    const class_data = class_database[class_id];
    const profile = data.profile;
    const equips = [];
    for (let i = 0; i < data.equips.length; i++) {
        const id = data.equips[i];
        if (!id) {
            equips[i] = "";
            continue;
        }
        if (i == 0) {
            equips[i] = weapon_database[id];
        } else {
            equips[i] = armor_database[id];
        }
    }
    const data_note = data.note;
    const actor_info_div = document.createElement("div");
    actor_info_div.id = "actor-info-div";
    data_display.appendChild(actor_info_div);
    const actor_name_div = document.createElement("div");
    actor_name_div.id = "actor-name-div";
    actor_name_div.textContent = `${name} ${nickname ? `(${nickname})` : ""}`;
    actor_info_div.appendChild(actor_name_div);
    const init_data_div = document.createElement("div");
    init_data_div.id = "actor-init-data-div";
    actor_info_div.appendChild(init_data_div);
    const actor_class_div = document.createElement("div");
    actor_class_div.id = "actor-class-div";
    init_data_div.appendChild(actor_class_div);
    const class_name_div = document.createElement("div");
    class_name_div.id = "actor-class-name-div";
    class_name_div.textContent = `CLASS: ${class_data ? class_data.name : ""}`;
    actor_class_div.appendChild(class_name_div);
    const init_level_div = document.createElement("div");
    init_level_div.id = "init-level-div";
    init_level_div.textContent = `INITIAL LEVEL: ${data.initialLevel}`;
    actor_class_div.appendChild(init_level_div);
    const max_level_div = document.createElement("div");
    max_level_div.id = "max-level-div";
    max_level_div.textContent = `MAX LEVEL: ${data.maxLevel}`;
    actor_class_div.appendChild(max_level_div);
    const equips_div = document.createElement("div");
    equips_div.id = "actor-equips-div";
    init_data_div.appendChild(equips_div);
    equips.forEach((equip) => {
        const name = equip ? equip.name : "---";
        const equip_div = document.createElement("div");
        equip_div.id = "actor-equip-div";
        equip_div.textContent = name;
        equips_div.appendChild(equip_div);
    })
    if (profile) {
        const profile_div = document.createElement("div");
        profile_div.id = "actor-profile-div";
        profile_div.textContent = profile;
        data_display.appendChild(profile_div);
    }
    const meta_div = document.createElement("div");
    meta_div.id = "actor-meta-data-div";
    data_display.appendChild(meta_div);
}

async function SET_ACTORS_DISPLAY() {
    const database = await ACTORS_DATABASE();
    const display = document.getElementById("database-display-div");
    const list_div = document.createElement("div");
    list_div.id = "database-display-list";
    display.appendChild(list_div);
    const list_buttons = [];
    for (let i = 0; i < database.length; i++) {
        if (i == 0) {
            const srch_div = document.createElement("div");
            srch_div.id = "list-search-div";
            srch_div.textContent = "SEARCH";
            list_div.appendChild(srch_div);
            const srch_inpt = document.createElement("input");
            srch_inpt.id = "list-search-input";
            srch_inpt.oninput = function () {
                const val = srch_inpt.value;
                if (!val) {
                    list_buttons.forEach((btn) => {
                        btn.style.display = "block";
                    })
                } else {
                    list_buttons.forEach((btn) => {
                        const btn_name = btn.textContent;
                        if (btn_name.match(val)) {
                            btn.style.display = "block";
                        } else {
                            btn.style.display = "none";
                        }
                    })
                }
            }
            srch_div.appendChild(srch_inpt);
            continue;
        }
        const item = database[i];
        if (!item) continue;
        const name = item.name;
        const btn = document.createElement("button");
        btn.id = "database-list-button";
        btn.textContent = name;
        btn.onclick = function () {
            data_display_div.innerHTML = "";
            DrawActorData(btn, item);
        }
        list_div.appendChild(btn);
        list_buttons.push(btn);
    }
    const data_display_div = document.createElement("div");
    data_display_div.id = "database-data-display";
    display.appendChild(data_display_div);
}

async function SET_ARMORS_DISPLAY() {
    const database = await ARMORS_DATABASE();
    const display = document.getElementById("database-display-div");
}

async function SET_CLASSES_DISPLAY() {
    const database = await CLASSES_DATABASE();
    const display = document.getElementById("database-display-div");
}

async function SET_ENEMIES_DISPLAY() {
    const database = await ENEMIES_DATABASE();
    const display = document.getElementById("database-display-div");
}

async function SET_ITEMS_DISPLAY() {
    const database = await ITEMS_DATABASE();
    const display = document.getElementById("database-display-div");
}

async function SET_SKILLS_DISPLAY() {
    const database = await SKILLS_DATABASE();
    const display = document.getElementById("database-display-div");
}

async function SET_STATES_DISPLAY() {
    const database = await STATES_DATABASE();
    const display = document.getElementById("database-display-div");
}

async function SET_TILESETS_DISPLAY() {
    const database = await TILESETS_DATABASE();
    const display = document.getElementById("database-display-div");
}

async function SET_TROOPS_DISPLAY() {
    const database = await TROOPS_DATABASE();
    const display = document.getElementById("database-display-div");
}

async function SET_WEAPONS_DISPLAY() {
    const database = await WEAPONS_DATABASE();
    const display = document.getElementById("database-display-div");
}

async function SET_DATABASE(type) {
    if (!type) {
        console.error('Please set database display type.');
        return;
    }
    const display = document.getElementById("database-display-div");
    display.innerHTML = "";
    switch (type) {
        case 'actors':
            SET_ACTORS_DISPLAY();
            break;
        case 'armors':
            SET_ARMORS_DISPLAY();
            break;
        case 'classes':
            SET_CLASSES_DISPLAY();
            break;
        case 'enemies':
            SET_ENEMIES_DISPLAY();
            break;
        case 'items':
            SET_ITEMS_DISPLAY();
            break;
        case 'skills':
            SET_SKILLS_DISPLAY();
            break;
        case 'states':
            SET_STATES_DISPLAY();
            break;
        case 'tilesets':
            SET_TILESETS_DISPLAY();
            break;
        case 'troops':
            SET_TROOPS_DISPLAY();
            break;
        case 'weapons':
            SET_WEAPONS_DISPLAY();
            break;
    }
}

async function DRAW_DATABASE() {
    CreateDatabaseNavigator();
    CreateDatabaseDisplay();
    SET_DATABASE('actors');
}

function START() {
    DRAW_3D_BACKGROUND();
    DRAW_DATABASE();
}