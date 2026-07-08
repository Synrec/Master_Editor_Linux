const renderer = PIXI.renderer;

class Map_Sprite extends PIXI.Container {
    constructor(map_obj, tileset_obj) {
        super();
        this._tagged_location = [0, 0];
        this._tile_size = 48;
        this._map_object = map_obj;
        this._tileset_object = tileset_obj;
        this.loadTilesetImages(tileset_obj);
        this.createLayers();
        this.createInputFunctions();
    }

    tileSize = function () {
        return this._tile_size;
    }

    mapObject = function () {
        return this._map_object;
    }

    tileObject = function () {
        return this._tileset_object;
    }

    tileTextures = function () {
        return this._tileset_textures;
    }

    lowerLayer = function () {
        return this._lower_layer;
    }

    upperLayer = function () {
        return this._upper_layer;
    }

    loadTilesetImages = async function (tileset_obj) {
        const textures = [];
        const base_path = process.cwd();
        const file_names = tileset_obj.tilesetNames;
        for (let i = 0; i < file_names.length; i++) {
            const file_name = file_names[i];
            if (!file_name) continue;
            const file_path = `file://${base_path}/project/img/tilesets/${file_name}.png`;
            const texture = await PIXI.Assets.load(file_path);
            textures.push(
                {
                    texture,
                    file_name
                }
            );
        }
        this._tileset_textures = textures;
    }

    createLayers = function () {
        const lower_layer = new PIXI.Container();
        this.addChild(lower_layer);
        this._lower_layer = lower_layer;
        const upper_layer = new PIXI.Container();
        this.addChild(upper_layer);
        this._upper_layer = upper_layer;
        const event_layer = new PIXI.Container();
        this.addChild(event_layer);
        this._events_layer = event_layer;
        const tag_layer = new PIXI.Container();
        this.addChild(tag_layer);
        this._tag_layer = tag_layer;
        const scroll_pin = new PIXI.Graphics();
        this.addChild(scroll_pin);
        this._scroll_pin = scroll_pin;
    }

    createInputFunctions = function () {
        const map_object = this.mapObject();
        const mw = map_object.width;
        const mh = map_object.height;
        const ts = this.tileSize();
        const w = mw * ts;
        const h = mh * ts;
        const canvas = this;
        canvas.eventMode = 'dynamic';
        this.on("pointerenter", () => {
            canvas._enableMouseTap = true;
        })
        this.on("pointerleave", () => {
            canvas._enableMouseTap = false;
        })
        this.on("pointertap", (ev) => {
            if (
                canvas._enableMouseTap &&
                !canvas._enableScrolling
            ) {
                canvas._enableScrolling = true;
                canvas._scroll_origin_x = ev.x;
                canvas._scroll_origin_y = ev.y;
            } else {
                canvas._enableScrolling = false;
                canvas._scroll_origin_x = undefined;
                canvas._scroll_origin_y = undefined;
                canvas.tagLocation(ev);
            }
        })
        this.on("pointermove", (ev) => {
            const canvas_dom = document.getElementById("map-display-div");
            if (!canvas_dom) return;
            const cw = canvas_dom.width;
            const ch = canvas_dom.height;
            if (canvas._enableScrolling) {
                const x = ev.x;
                const y = ev.y;
                const ox = canvas._scroll_origin_x;
                const oy = canvas._scroll_origin_y;
                const dx = ox - x;
                const dy = oy - y;
                const s = 5;
                if (Math.abs(dx) > s) {
                    canvas.x += Math.round(dx / 10);
                    if (dx < 0 && (canvas.x + w) < cw) {
                        canvas.x = cw - w;
                    }
                    if (dx > 0 && canvas.x > 0) {
                        canvas.x = 0;
                    }
                }
                if (Math.abs(dy) > s) {
                    canvas.y += Math.round(dy / 10);
                    if (dy < 0 && (canvas.y + h) < ch) {
                        canvas.y = ch - h;
                    }
                    if (dy > 0 && canvas.y > 0) {
                        canvas.y = 0;
                    }
                }
            }
        })
    }

    getTexture = function (id) {
        const textures_obj = this.tileTextures();
        if (id >= 2048 && id <= 2815) {
            return { data: textures_obj[0], start: 2048 };
        }
        if (id >= 2816 && id <= 4351) {
            return { data: textures_obj[1], start: 2816 };
        }
        if (id >= 4352 && id <= 5887) {
            return { data: textures_obj[2], start: 4352 };
        }
        if (id >= 5888 && id <= 8191) {
            return { data: textures_obj[3], start: 5888 };
        }
        if (id >= 1536 && id <= 1663) {
            return { data: textures_obj[4], start: 1536 };
        }
        if (id >= 0 && id <= 255) {
            return { data: textures_obj[5], start: 0 };
        }
        if (id >= 256 && id <= 511) {
            return { data: textures_obj[6], start: 256 };
        }
        if (id >= 512 && id <= 767) {
            return { data: textures_obj[7], start: 512 };
        }
        if (id >= 768 && id <= 1023) {
            return { data: textures_obj[8], start: 768 };
        }
        return null;
    }

    isTileAuto = function (index) {
        return index >= 2048 && index <= 8191;
    }

    getAutotileKind = function (index) {
        return Math.floor((index - 2048) / 48);
    }

    getAutotileShape = function (index) {
        return (index - 2048) % 48;
    };

    isTileA1 = function (index) {
        return index >= 2048 && index <= 2815;
    }

    isTileA2 = function (index) {
        return index >= 2816 && index <= 4351;
    }

    isTileA3 = function (index) {
        return index >= 4352 && index <= 5887;
    }

    isTileA4 = function (index) {
        return index >= 5888 && index <= 8191;
    }

    isTileA5 = function (index) {
        return index >= 1536 && index <= 1663;
    }

    isTileBCDE = function (index) {
        return index >= 0 && index <= 1023;
    }

    _isTableTile = function (index) {
        const tile_obj = this.tileObject();
        const flags = tile_obj.flags;
        return this.isTileA2(index) && (flags[index] & 0x80);
    };

    FLOOR_AUTOTILE_TABLE = [
        [[2, 4], [1, 4], [2, 3], [1, 3]], [[2, 0], [1, 4], [2, 3], [1, 3]],
        [[2, 4], [3, 0], [2, 3], [1, 3]], [[2, 0], [3, 0], [2, 3], [1, 3]],
        [[2, 4], [1, 4], [2, 3], [3, 1]], [[2, 0], [1, 4], [2, 3], [3, 1]],
        [[2, 4], [3, 0], [2, 3], [3, 1]], [[2, 0], [3, 0], [2, 3], [3, 1]],
        [[2, 4], [1, 4], [2, 1], [1, 3]], [[2, 0], [1, 4], [2, 1], [1, 3]],
        [[2, 4], [3, 0], [2, 1], [1, 3]], [[2, 0], [3, 0], [2, 1], [1, 3]],
        [[2, 4], [1, 4], [2, 1], [3, 1]], [[2, 0], [1, 4], [2, 1], [3, 1]],
        [[2, 4], [3, 0], [2, 1], [3, 1]], [[2, 0], [3, 0], [2, 1], [3, 1]],
        [[0, 4], [1, 4], [0, 3], [1, 3]], [[0, 4], [3, 0], [0, 3], [1, 3]],
        [[0, 4], [1, 4], [0, 3], [3, 1]], [[0, 4], [3, 0], [0, 3], [3, 1]],
        [[2, 2], [1, 2], [2, 3], [1, 3]], [[2, 2], [1, 2], [2, 3], [3, 1]],
        [[2, 2], [1, 2], [2, 1], [1, 3]], [[2, 2], [1, 2], [2, 1], [3, 1]],
        [[2, 4], [3, 4], [2, 3], [3, 3]], [[2, 4], [3, 4], [2, 1], [3, 3]],
        [[2, 0], [3, 4], [2, 3], [3, 3]], [[2, 0], [3, 4], [2, 1], [3, 3]],
        [[2, 4], [1, 4], [2, 5], [1, 5]], [[2, 0], [1, 4], [2, 5], [1, 5]],
        [[2, 4], [3, 0], [2, 5], [1, 5]], [[2, 0], [3, 0], [2, 5], [1, 5]],
        [[0, 4], [3, 4], [0, 3], [3, 3]], [[2, 2], [1, 2], [2, 5], [1, 5]],
        [[0, 2], [1, 2], [0, 3], [1, 3]], [[0, 2], [1, 2], [0, 3], [3, 1]],
        [[2, 2], [3, 2], [2, 3], [3, 3]], [[2, 2], [3, 2], [2, 1], [3, 3]],
        [[2, 4], [3, 4], [2, 5], [3, 5]], [[2, 0], [3, 4], [2, 5], [3, 5]],
        [[0, 4], [1, 4], [0, 5], [1, 5]], [[0, 4], [3, 0], [0, 5], [1, 5]],
        [[0, 2], [3, 2], [0, 3], [3, 3]], [[0, 2], [1, 2], [0, 5], [1, 5]],
        [[0, 4], [3, 4], [0, 5], [3, 5]], [[2, 2], [3, 2], [2, 5], [3, 5]],
        [[0, 2], [3, 2], [0, 5], [3, 5]], [[0, 0], [1, 0], [0, 1], [1, 1]]
    ];

    WALL_AUTOTILE_TABLE = [
        [[2, 2], [1, 2], [2, 1], [1, 1]], [[0, 2], [1, 2], [0, 1], [1, 1]],
        [[2, 0], [1, 0], [2, 1], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]],
        [[2, 2], [3, 2], [2, 1], [3, 1]], [[0, 2], [3, 2], [0, 1], [3, 1]],
        [[2, 0], [3, 0], [2, 1], [3, 1]], [[0, 0], [3, 0], [0, 1], [3, 1]],
        [[2, 2], [1, 2], [2, 3], [1, 3]], [[0, 2], [1, 2], [0, 3], [1, 3]],
        [[2, 0], [1, 0], [2, 3], [1, 3]], [[0, 0], [1, 0], [0, 3], [1, 3]],
        [[2, 2], [3, 2], [2, 3], [3, 3]], [[0, 2], [3, 2], [0, 3], [3, 3]],
        [[2, 0], [3, 0], [2, 3], [3, 3]], [[0, 0], [3, 0], [0, 3], [3, 3]]
    ];

    WATERFALL_AUTOTILE_TABLE = [
        [[2, 0], [1, 0], [2, 1], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]],
        [[2, 0], [3, 0], [2, 1], [3, 1]], [[0, 0], [3, 0], [0, 1], [3, 1]]
    ];

    adjustedTexture = function (whole_texture, start_index, offset_index, dx, dy) {
        const tileId = start_index + offset_index;
        const ts = this.tileSize();
        let x = 0;
        let y = 0;
        if (this.isTileAuto(start_index)) {
            let autotileTable = this.FLOOR_AUTOTILE_TABLE;
            const kind = this.getAutotileKind(tileId);
            const shape = this.getAutotileShape(tileId);
            let tx = kind % 8;
            let ty = Math.floor(kind / 8);
            let bx = 0;
            let by = 0;
            let setNumber = 0;
            let isTable = false;
            let animX = 0;
            let animY = 0;
            if (this.isTileA1(tileId)) {
                setNumber = 0;
                if (kind === 0) {
                    animX = 2;
                    by = 0;
                } else if (kind === 1) {
                    animX = 2;
                    by = 3;
                } else if (kind === 2) {
                    bx = 6;
                    by = 0;
                } else if (kind === 3) {
                    bx = 6;
                    by = 3;
                } else {
                    bx = Math.floor(tx / 4) * 8;
                    by = ty * 6 + Math.floor(tx / 2) % 2 * 3;
                    if (kind % 2 === 0) {
                        animX = 2;
                    }
                    else {
                        bx += 6;
                        autotileTable = this.WATERFALL_AUTOTILE_TABLE;
                        animY = 1;
                    }
                }
            }
            if (this.isTileA2(tileId)) {
                setNumber = 1;
                bx = tx * 2;
                by = (ty - 2) * 3;
                isTable = this._isTableTile(tileId);
            }
            if (this.isTileA3(tileId)) {
                setNumber = 2;
                bx = tx * 2;
                by = (ty - 6) * 2;
                autotileTable = this.WALL_AUTOTILE_TABLE;
            }
            if (this.isTileA4(tileId)) {
                setNumber = 3;
                bx = tx * 2;
                by = Math.floor((ty - 10) * 2.5 + (ty % 2 === 1 ? 0.5 : 0));
                if (ty % 2 === 1) {
                    autotileTable = this.WALL_AUTOTILE_TABLE;
                }
            }
            const table = autotileTable[shape];
            if (table) {
                const w1 = ts * 0.5;
                const h1 = ts * 0.5;
                const sprites = [];
                for (let i = 0; i < 4; i++) {
                    let qsx = table[i][0];
                    let qsy = table[i][1];
                    let sx1 = (bx * 2 + qsx) * w1;
                    let sy1 = (by * 2 + qsy) * h1;
                    let dx1 = dx + (i % 2) * w1;
                    let dy1 = dy + Math.floor(i / 2) * h1;
                    if (isTable && (qsy === 1 || qsy === 5)) {
                        let qsx2 = qsx;
                        let qsy2 = 3;
                        if (qsy === 1) {
                            qsx2 = [0, 3, 2, 1][qsx];
                        }
                        let sx2 = (bx * 2 + qsx2) * w1;
                        let sy2 = (by * 2 + qsy2) * h1;
                        const texture = new PIXI.Texture({
                            source: whole_texture,
                            frame: new PIXI.Rectangle(sx1, sy1, ts * 0.5, ts * 0.5)
                        })
                        const sprite = new PIXI.Sprite(texture);
                        sprite.x = dx1;
                        sprite.y = dy1;
                        sprites.push(sprite);
                        dy1 += h1 / 2;
                        const texture2 = new PIXI.Texture({
                            source: whole_texture,
                            frame: new PIXI.Rectangle(sx2, sy2, ts * 0.5, ts * 0.25)
                        })
                        const sprite2 = new PIXI.Sprite(texture2);
                        sprite2.x = dx1;
                        sprite2.y = dy1;
                        sprites.push(sprite2);
                    } else {
                        const texture = new PIXI.Texture({
                            source: whole_texture,
                            frame: new PIXI.Rectangle(sx1, sy1, ts * 0.5, ts * 0.5)
                        })
                        const sprite = new PIXI.Sprite(texture);
                        sprite.x = dx1;
                        sprite.y = dy1;
                        sprites.push(sprite);
                    }
                }
                return sprites;
            }
        }
        if (this.isTileA5(start_index)) {
            x = (Math.floor(tileId / 128) % 2 * 8 + tileId % 8) * ts;
            y = (Math.floor(tileId % 256 / 8) % 16) * ts;
            const texture = new PIXI.Texture({
                source: whole_texture,
                frame: new PIXI.Rectangle(x, y, ts, ts)
            })
            const sprite = new PIXI.Sprite(texture);
            return sprite;
        }
        if (this.isTileBCDE(start_index)) {
            x = (Math.floor(tileId / 128) % 2 * 8 + tileId % 8) * ts;
            y = (Math.floor(tileId % 256 / 8) % 16) * ts;
            const texture = new PIXI.Texture({
                source: whole_texture,
                frame: new PIXI.Rectangle(x, y, ts, ts)
            })
            const sprite = new PIXI.Sprite(texture);
            return sprite;
        }
        return new PIXI.Sprite();
    }

    drawLayers = function (layer, data_lower, data_upper) {
        const map_object = this.mapObject();
        const mw = map_object.width;
        const mh = map_object.height;
        for (let y = 0; y < mh; y++) {
            for (let x = 0; x < mw; x++) {
                const lower_id = data_lower[y][x];
                const lower_obj = this.getTexture(lower_id);
                const texture_lower_data = lower_obj.data;
                const texture_lower_start = lower_obj.start;
                const lower_asset = texture_lower_data.texture;
                const lower_index = lower_id - texture_lower_start;
                const ts = this.tileSize();
                const dx = x * ts;
                const dy = y * ts;
                const lower_texture = this.adjustedTexture(lower_asset, texture_lower_start, lower_index, dx, dy);
                if (Array.isArray(lower_texture)) {
                    lower_texture.forEach((sprite) => {
                        layer.addChild(sprite);
                    })
                } else {
                    if (!isNaN(lower_id)) {
                        lower_texture.x = dx;
                        lower_texture.y = dy;
                        layer.addChild(lower_texture);
                    }
                }
                const upper_id = data_upper[y][x];
                const upper_obj = this.getTexture(upper_id);
                const texture_upper_data = upper_obj.data;
                const texture_upper_start = upper_obj.start;
                const upper_asset = texture_upper_data.texture;
                const upper_index = upper_id - texture_upper_start;
                const upper_texture = this.adjustedTexture(upper_asset, texture_upper_start, upper_index, dx, dy);
                if (Array.isArray(upper_texture)) {
                    upper_texture.forEach((sprite) => {
                        layer.addChild(sprite);
                    })
                } else {
                    if (!isNaN(upper_id)) {
                        upper_texture.x = dx;
                        upper_texture.y = dy;
                        layer.addChild(upper_texture);
                    }
                }
            }
        }
    }

    tagLocation = function (event) {
        this._tagged_location = [0, 0];
        const map_object = this.mapObject();
        const mw = map_object.width;
        const mh = map_object.height;
        const ts = this.tileSize();
        const ex = event.x;
        const ey = event.y;
        const display_element = document.getElementById("map-display-div");
        const rect = display_element.getBoundingClientRect();
        const sx = display_element.width / (rect.right - rect.left);
        const sy = display_element.height / (rect.bottom - rect.top);
        const tx = ((ex - rect.left) * sx) - (this.x);
        const ty = ((ey - rect.top) * sy) - (this.y);
        for (let y = 0; y < mh; y++) {
            for (let x = 0; x < mw; x++) {
                const px = x * ts;
                const py = y * ts;
                if (
                    tx >= px &&
                    tx <= px + ts &&
                    ty >= py &&
                    ty <= py + ts
                ) {
                    this._tagged_location = [x, y];
                    this.updateMapData();
                    return;
                }
            }
        }
    }

    update = function (deltaTime) {
        this.updateDraw(deltaTime);
    }

    updateDraw = function () {
        if (!Array.isArray(this.tileTextures())) return;
        this.updateDrawLower();
        this.updateDrawUpper();
        this.updateDrawEvents();
        this.updateDrawTagged();
        this.updateScrollPin();
    }

    updateDrawLower = function () {
        const map_object = this.mapObject();
        const map_file = map_object.file;
        const map_id = map_file._id;
        const lower_id = this._lower_map_id;
        if (lower_id != map_id) {
            const layer = this.lowerLayer();
            const mw = map_object.width;
            const mh = map_object.height;
            this._lower_map_id = map_id;
            const data = map_object.data;
            const zeroth_layer = [];
            const primary_layer = [];
            for (let y = 0; y < mh; y++) {
                zeroth_layer[y] = [];
                primary_layer[y] = [];
                for (let x = 0; x < mw; x++) {
                    zeroth_layer[y][x] = data[(0 * mh + y) * mw + x] || 0;
                    primary_layer[y][x] = data[(1 * mh + y) * mw + x] || 0;
                }
            }
            this.drawLayers(layer, zeroth_layer, primary_layer);
        }
    }

    updateDrawUpper = function () {
        const map_object = this.mapObject();
        const map_file = map_object.file;
        const map_id = map_file._id;
        const upper_id = this._upper_map_id;
        if (upper_id != map_id) {
            const layer = this.upperLayer();
            const mw = map_object.width;
            const mh = map_object.height;
            this._upper_map_id = map_id;
            const data = map_object.data;
            const secondary_layer = [];
            const tertiary_layer = [];
            for (let y = 0; y < mh; y++) {
                secondary_layer[y] = [];
                tertiary_layer[y] = [];
                for (let x = 0; x < mw; x++) {
                    secondary_layer[y][x] = data[(2 * mh + y) * mw + x] || 0;
                    tertiary_layer[y][x] = data[(3 * mh + y) * mw + x] || 0;
                }
            }
            this.drawLayers(layer, secondary_layer, tertiary_layer);
        }
    }

    updateDrawEvents = function () {
        const map_object = this.mapObject();
        const map_file = map_object.file;
        const map_id = map_file._id;
        const events_id = this._event_map_id;
        if (events_id != map_id) {
            const ts = this.tileSize();
            this._event_map_id = map_id;
            const events = map_object.events;
            const layer = this._events_layer;
            layer.children.forEach((child) => {
                if (child.parent) {
                    child.parent.removeChild(child);
                }
            })
            layer.children = [];
            events.forEach((data) => {
                if (data) {
                    const data_map_x = data.x;
                    const data_map_y = data.y;
                    const mx = data_map_x * ts;
                    const my = data_map_y * ts;
                    const gfx = new PIXI.Graphics()
                        .rect(mx + 4, my + 4, ts - 8, ts - 8)
                        .fill({ color: 0xffffff, alpha: 0.5 })
                        .stroke({ width: 4, color: 0x000000 })
                    layer.addChild(gfx);
                }
            })
        }
    }

    updateDrawTagged = function () {
        if (!Array.isArray(this._saved_tag_loc)) {
            this._saved_tag_loc = [];
        }
        const map_object = this.mapObject();
        const mw = map_object.width;
        const mh = map_object.height;
        const layer = this._tag_layer;
        if (
            this._saved_tag_loc[0] != this._tagged_location[0] ||
            this._saved_tag_loc[1] != this._tagged_location[1]
        ) {
            this._saved_tag_loc = JSON.parse(JSON.stringify(this._tagged_location));
            const lx = this._tagged_location[0];
            const ly = this._tagged_location[1];
            const ts = this.tileSize();
            layer.children.forEach((child) => {
                if (child.parent) {
                    child.parent.removeChild(child);
                }
            })
            layer.children = [];
            const gfx = new PIXI.Graphics()
                .rect(lx * ts, ly * ts, ts, ts)
                .fill({ color: 0xffffff, alpha: 0.5 })
                .stroke({ width: 4, color: 0xaaaaff })
            layer.addChild(gfx);
        }
    }

    updateScrollPin = function () {
        const gfx = this._scroll_pin;
        if (
            !this._enableScrolling &&
            this._draw_pin
        ) {
            this._draw_pin = false;
            gfx.clear();
        } else if (
            this._enableScrolling &&
            !this._draw_pin
        ) {
            this._draw_pin = true;
            const ex = this._scroll_origin_x;
            const ey = this._scroll_origin_y;
            gfx.clear();
            gfx.circle(ex, ey, 18)
                .fill({ color: 0x00ff00, alpha: 1 })
                .stroke({ width: 4, color: 0xffaaff })
        }
    }

    updateMapData = function () {
        try {
            const data_div = document.getElementById("map-data-div");
            if (!data_div) return;
            data_div.innerHTML = "";
            const tile_object = this.tileObject();
            const tile_flags = tile_object.flags;
            const map_object = this.mapObject();
            const tile_data = map_object.data;
            const mx = this._tagged_location[0];
            const my = this._tagged_location[1];
            const mw = map_object.width;
            const mh = map_object.height;
            const layered_tiles = this.layeredTiles(tile_data, mx, my, mw, mh);
            const region_id = tile_data[(5 * mh + my) * mw + mx] || 0;
            const map_region_div = document.createElement("div");
            map_region_div.id = "map-region-div";
            map_region_div.className = "map-region-div";
            map_region_div.textContent = `REGION: ${region_id}`;
            data_div.appendChild(map_region_div);
            const terrain_tag = this.terrainTag(tile_flags, layered_tiles) || 0;
            const map_terrain_div = document.createElement("div");
            map_terrain_div.id = "map-terrain-div";
            map_terrain_div.className = "map-terrain-div";
            map_terrain_div.textContent = `TERRAIN: ${terrain_tag}`;
            data_div.appendChild(map_terrain_div);
            const events = map_object.events;
            const event = events.find((data) => {
                if (!data) return;
                return data.x == mx && data.y == my;
            })
            if (event) {
                const event_data_div = document.createElement("div");
                event_data_div.id = "event-data-div";
                event_data_div.className = "event-data-div";
                data_div.appendChild(event_data_div);
                const event_name_div = document.createElement("div");
                event_name_div.id = "event-name-div";
                event_name_div.className = "event-name-div";
                event_name_div.textContent = `Name: ${event.name} [ID: ${event.id}]`;
                event_data_div.appendChild(event_name_div);
                const event_pgcnt_div = document.createElement("div");
                event_pgcnt_div.id = "event-pages-div";
                event_pgcnt_div.className = "event-pages-div";
                event_pgcnt_div.textContent = `Pages: ${event.pages.length}`;
                event_data_div.appendChild(event_pgcnt_div);
                console.log(event);
            }
            const map_pos_div = document.createElement("div");
            map_pos_div.id = "map-pos-div";
            map_pos_div.className = "map-pos-div";
            map_pos_div.textContent = `X: ${mx} | Y: ${my}`;
            data_div.appendChild(map_pos_div);
        } catch (e) {
            console.error(e);
        }
    }

    layeredTiles(data, mx, my, mw, mh) {
        const tiles = [];
        for (let i = 0; i < 4; i++) {
            tiles.push(data[((3 - i) * mh + my) * mw + mx] || 0);
        }
        return tiles;
    }

    terrainTag(flags, layered_tiles) {
        for (const tile of layered_tiles) {
            const tag = flags[tile] >> 12;
            if (tag > 0) {
                return tag;
            }
        }
        return 0;
    }
}