

const EXECUTION_INTERVAL = 10;
const CANVAS_SIZE = 80;
const THRESHHOLD = 150;
const PLAYSER_SIZE_HOSEI = 1;
const CHECK_DISTANCE = 3;
const MAGNIFICATION = 3;
const CANVAS_SMALL_LIMIT = CANVAS_SIZE / 100 * 2
const CAMERA_MOVE_UNIT = 10;
const PLAYER_MOVE_UNIT = 5;
const PLAYER_SPEED = 1;

var image;
// var player = {};
var map = [];
var size = 0;
var position = {};
var start = [];
var end = [];
var players = [];
var wall_width = 0;
var camera_position = { x: 100, y: 150, z: 100 }
var player_pass = [];
var first_play = true;
var player_num = 0;
var player_size = 3;

$(function () {
    var finish = false;
    var auto = false;
    var display = true;
    var start_flg = false;
    var end_flg = false;
    var rows = [];
    var clms = [];

    dragFile();

    console.log('gamestart');

    $('#load').on('click', function () {
        setInitial();
        display = true;
        start_flg = false;
        end_flg = false;
        finish = false;
        auto = false;
        createMeiro();
        $('#show').click();
        $('#msg').html('スタートを指定してください');
    });

    $('#show').on('click', function () {
        display = displayBtn(display);
        if (display) {
            $('#show').html('非表示');
        } else {
            $('#show').html('表示');
        }
    });

    $('.move').on('click', function () {
        const btn = this.id;
        $('#msg').html('　');
        player = movePlayer_btn(map, player, btn);
        displayLoad(CANVAS_SIZE, map, player);
        judgeGoal(player);
    });

    $('.a_move').on('click', function () {
        const btn = this.id;
        player = moveCamera_btn(btn);
    });

    $('.p_move').on('click', function () {
        const btn = this.id;
        player = moveP_btn(btn);
    });

    $('html').keyup(function (e) {
        const key = e.which;
        if (key === 37 || key === 38 || key === 39 || key === 40) {
            $('#msg').html('　');
            player = movePlayer_key(map, player, key);
            displayLoad(CANVAS_SIZE, map, player);
            judgeGoal(player);
        }
    });

    $(document).on('click', '.p', function () {
        if (!start_flg) {
            if (window.confirm('スタートはここでいいですか？')) {
                start = setStartEnd(this.id);
            }
            if (start.length > 0) {
                start_flg = true;
                $('#msg').html('ゴールを指定してください');
            }
        } else if (!end_flg) {
            if (window.confirm('ゴールはここでいいですか？')) {
                end = setStartEnd(this.id);
            }
            if (end.length > 0) {
                end_flg = true;
                $('#msg').html('ゲームを開始！！');
                player = setPlayer();
                players.push(player);
                goal = setGoal();
            }
        }
        displayLoad(size, map, player);
    });

    $('#step').on('click', function () {
        if (!finish) {
            var new_players = createAvatar();
            finish = displayLoad_bunshin(size, map, new_players);
            for (var i = 0; i < new_players.length; i++) {
                var new_player = new_players[i];
                finish = judgeGoal(new_player);
            }
        }
    });

    $('#create').on('click', function () {
        createPlayer();
    });

    $('#exe').on('click', function () {
        moveSVGPlayer();
    });

    function createPlayer() {
        var id = 'player' + 0;
        var x = 3;
        var y = 16;
        player_size = 3;
        var pass_idx = 999;
        var direction = '';
        var distance = 0;
        var root = [];
        // var player = players[0];
        var player = new Player(id, x, y, player_size, pass_idx, direction, distance, root);
        players.push(player);
        // addSvgRectElement(id, x, y, size, size, 'yellow');
        addAframeElement(id, x, y, player_size, 'yellow');
    }

    function moveSVGPlayer() {
        if (first_play) {
            var player = players[0];
            for (var i = 0; i < player_pass.length; i++) {
                var pass = player_pass[i];
                if (player.y === pass.y && pass.x <= player.x && (pass.x + pass.width) >= player.x) {
                    if (pass.width >= pass.height) {
                        player.direction = 'east';
                        player.x += PLAYER_SPEED;
                        player.pass_idx = i;
                        break;
                    } else {
                        player.direction = 'south';
                        player.y -= PLAYER_SPEED;
                        player.pass_idx = i;
                        break;
                    }
                }
            }
            $('#a_' + player.id).attr('position', player.x + ' ' + 2 + ' ' + player.y);
            first_play = false;
        } else {
            for (var i = 0; i < players.length; i++) {
                var player = players[i];
                for (var j = 0; j < player_pass.length; j++) {
                    var pass = player_pass[j];
                    if (player.pass_idx === j && player.x <= (pass.x + pass.width)) {
                        switch (player.direction) {
                            case 'north':
                                player.y -= PLAYER_SPEED;
                                break;
                            case 'east':
                                player.x += PLAYER_SPEED;
                                break;
                            case 'south':
                                player.y += PLAYER_SPEED;
                                break;
                            case 'west':
                                player.x -= PLAYER_SPEED;
                                break;
                            default:
                                console.log('error btn= ' + player);
                        }
                        $('#a_' + player.id).attr('position', player.x + ' ' + 2 + ' ' + player.y);
                        // break;
                    }
                    if (player.pass_idx !== j && player.y === player_pass[j].y
                        && player.x >= pass.x && player.x <= (pass.x + pass.width)
                        && (player.direction === 'north' || player.direction === 'south')) {
                        var left_dif = player.x - pass.x;
                        var right_dif = pass.x + pass.width - player.x;
                        // constructor(x, y, size, pass_idx, direction, root) {
                        if (left_dif > right_dif) {
                            player_num += 1;
                            var player_id = 'player' + player_num;
                            var new_player = new Player(player_id, player.x - PLAYER_SPEED, player.y, size, j, "west", pass.width, "");
                            players.push(new_player);
                            // addSvgRectElement(new_player.id, new_player.x, new_player.y, new_player.size, new_player.size, 'yellow');
                            addAframeElement(new_player.id, new_player.x, new_player.y, player_size, 'yellow');
                        } else if (left_dif < right_dif) {
                            player_num += 1;
                            var player_id = 'player' + player_num;
                            var new_player = new Player(player_id, player.x + PLAYER_SPEED, player.y, player_size, j, "east", pass.width, "");
                            players.push(new_player);
                            // addSvgRectElement(new_player.id, new_player.x, new_player.y, new_player.size, new_player.size, 'yellow');
                            addAframeElement(new_player.id, new_player.x, new_player.y, player_size, 'yellow');
                        }
                    } else if (player.pass_idx !== j && player.x === player_pass[j].x
                        && player.y >= pass.y && player.y <= (pass.y + pass.height)
                        && (player.direction === 'west' || player.direction === 'east')) {
                        var up_dif = player.y - pass.y;
                        var down_dif = pass.y + pass.height - player.y;
                        if (up_dif > down_dif) {
                            player_num += 1;
                            var player_id = 'player' + player_num;
                            var new_player = new Player(player_id, player.x, player.y - PLAYER_SPEED, player_size, j, "north", pass.height, "");
                            players.push(new_player);
                            // addSvgRectElement(new_player.id, new_player.x, new_player.y, new_player.size, new_player.size, 'yellow');
                            addAframeElement(new_player.id, new_player.x, new_player.y, player_size, j, 'yellow');
                        } else if (up_dif < down_dif) {
                            player_num += 1;
                            var player_id = 'player' + player_num;
                            var new_player = new Player(player_id, player.x, player.y + PLAYER_SPEED, player_size, j, "south", pass.height, "");
                            players.push(new_player);
                            // addSvgRectElement(new_player.id, new_player.x, new_player.y, new_player.size, new_player.size, 'yellow');
                            addAframeElement(new_player.id, new_player.x, new_player.y, player.size, j, 'yellow', "");
                        }
                    }
                }
            }
        }
    }

    function addSvgRectElement(id, x, y, width, height, color) {
        var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("id", "s_" + id);
        rect.setAttribute("x", x * MAGNIFICATION);
        rect.setAttribute("y", y * MAGNIFICATION);
        rect.setAttribute("width", width * MAGNIFICATION);
        rect.setAttribute("height", height * MAGNIFICATION);
        rect.setAttribute("fill", color);
        $('#svg_meiro').append(rect);
    }

    function addAframeElement(id, x, y, radius, color) {
        var str = '<a-sphere id=a_' + id + ' color="' + color + '" radius="' + radius + '" position="' + x + ' 2 ' + y + '" ></a-sphere>';
        $('#a_meiro').append(str);
    }

    $('#auto').on('click', function () {
        auto = true;
        if (auto) {
            searchGoal();
        }
    });

    $('#download').on('click', function () {
        if (map.length !== 0) {
            downloadCsv(map);
        }
    });

    function searchGoal() {
        if (!finish) {
            var new_players = createAvatar();
            finish = displayLoad_bunshin(size, map, new_players);
            for (var i = 0; i < new_players.length; i++) {
                var new_player = new_players[i];
                finish = judgeGoal(new_player);
            }
        }
        if (auto) {
            setTimeout(function () { searchGoal() }, EXECUTION_INTERVAL);
        }
    }

    function createAvatar() {
        const new_players = [];
        for (var i = 0; i < players.length; i++) {
            const player = players[i];
            const movelist = checkDirection(map, player, player.pre_move)
            for (var n = 0; n < movelist.length; n++) {
                var new_player = { ...player };
                move = movelist[n];
                new_player = movePlayer(map, new_player, move);
                rows.push(new_player.row);
                clms.push(new_player.clm);
                new_players.push(new_player);
            };
        }
        players = new_players;
        return new_players;
    }

});

function moveCamera_btn(btn) {
    switch (btn) {
        case 'a_up':
            camera_position.z -= CAMERA_MOVE_UNIT;
            break;
        case 'a_left':
            camera_position.x -= CAMERA_MOVE_UNIT;
            break;
        case 'a_right':
            camera_position.x += CAMERA_MOVE_UNIT;
            break;
        case 'a_down':
            camera_position.z += CAMERA_MOVE_UNIT;
            break;
        case 'a_zmin':
            camera_position.y -= CAMERA_MOVE_UNIT;
            break;
        case 'a_zmout':
            camera_position.y += CAMERA_MOVE_UNIT;
            break;
        default:
            console.log('error btn= ' + btn);
    }
    $('#a_camera').attr('position', camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z);
};

function moveP_btn(btn) {
    var position = $('#player').attr('position');
    switch (btn) {
        case 'p_up':
            position.z -= PLAYER_MOVE_UNIT;
            break;
        case 'p_left':
            position.x -= PLAYER_MOVE_UNIT;
            break;
        case 'p_right':
            position.x += PLAYER_MOVE_UNIT;
            break;
        case 'p_down':
            position.z += PLAYER_MOVE_UNIT;
            break;
        default:
            console.log('error btn= ' + btn);
    }
    $('#sphere').attr('position', position.x + ' ' + position.y + ' ' + position.z);
};


function setPlayer() {
    var pos = { row: 0, clm: 0, pre_move: "" };
    pos.row = Number(start[0].substr(0, 2));
    pos.clm = Number(start[0].substr(2, 2));

    for (var i = 1; i < start.length; i++) {
        var row = Number(start[i].substr(0, 2));
        var clm = Number(start[i].substr(2, 2));
        if (pos.row > row) {
            pos.row = row;
        }
        if (pos.clm > clm) {
            pos.clm = clm;
        }
    }
    return pos;
}

function setGoal() {
    var pos = { row: 0, clm: 0 };
    pos.row = Number(end[0].substr(0, 2));
    pos.clm = Number(end[0].substr(2, 2));

    for (var i = 1; i < end.length; i++) {
        var row = Number(end[i].substr(0, 2));
        var clm = Number(end[i].substr(2, 2));
        if (pos.row > row) {
            pos.row = row;
        }
        if (pos.clm > clm) {
            pos.clm = clm;
        }
    }
    return pos;
}

function setInitial() {
    start = [];
    end = [];
    player = {};
    var cv = document.createElement('canvas');
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    $('#st_msg').css({ display: 'inline' });
    $('#show').css({ display: 'inline' });
}

function displayBtn(display) {
    if (display) {
        $('#drop').css({ display: 'none' });
        return false;
    } else {
        $('#drop').css({ display: 'flex' });
        return true;
    }
}

function judgeGoal(player) {
    if (player.row === goal.row && player.clm === goal.clm) {
        console.log('GameClear');
        console.log(player);
        // displayLoadtoGoal(player, size, map);
        return true;
    };
    return false;
}

function checkDirection(map, player, pre_move) {
    const movelist = [];
    switch (pre_move) {
        case 'up':
            if (map[player.row - 1][player.clm] === 1
                && map[player.row - 1][player.clm + player_size] === 1) {
                movelist.push('up');
            }
            if (map[player.row][player.clm - 1] = 1
                && map[player.row][player.clm - CHECK_DISTANCE] === 1
                && map[player.row + player_size][player.clm - 1] === 1
                && map[player.row + player_size][player.clm - CHECK_DISTANCE] === 1
                && (map[player.row + player_size + 1][player.clm - 1] === 0
                    || map[player.row + player_size + 1][player.clm - CHECK_DISTANCE] === 0)
            ) {
                movelist.push('left');
            }
            if (map[player.row][player.clm + player_size + 1] === 1
                && map[player.row][player.clm + player_size + CHECK_DISTANCE] === 1
                && map[player.row + player_size][player.clm + player_size + 1] === 1
                && map[player.row + player_size][player.clm + player_size + CHECK_DISTANCE] === 1
                && (map[player.row + player_size + 1][player.clm + player_size + 1] === 0
                    || map[player.row + player_size + 1][player.clm + player_size + CHECK_DISTANCE] === 0)
            ) {
                movelist.push('right');
            }
            break;
        case 'left':
            if (map[player.row - 1][player.clm] === 1
                && map[player.row - CHECK_DISTANCE][player.clm] === 1
                && map[player.row - 1][player.clm + player_size] === 1
                && map[player.row - 1 - CHECK_DISTANCE][player.clm + player_size] === 1
                && (map[player.row - 1][player.clm + player_size + 1] === 0
                    || map[player.row - 1 - CHECK_DISTANCE][player.clm + player_size + 1] === 0)
            ) {
                movelist.push('up');
            }
            if (map[player.row][player.clm - 1] === 1
                && map[player.row + player_size][player.clm - 1] === 1) {
                movelist.push('left');
            }
            if (map[player.row + player_size + 1][player.clm] === 1
                && map[player.row + player_size + CHECK_DISTANCE][player.clm] === 1
                && map[player.row + player_size + 1][player.clm + player_size] === 1
                && map[player.row + player_size + CHECK_DISTANCE][player.clm + player_size] === 1
                && (map[player.row + player_size + 1][player.clm + player_size + 1] === 0
                    || map[player.row + player_size + CHECK_DISTANCE][player.clm + player_size + 1] === 0)
            ) {
                movelist.push('down');
            }
            break;
        case 'right':
            if (map[player.row - 1][player.clm] === 1
                && map[player.row - CHECK_DISTANCE][player.clm] === 1
                && map[player.row - 1][player.clm + player_size] === 1
                && map[player.row - 1 - CHECK_DISTANCE][player.clm + player_size] === 1
                && (map[player.row - 1][player.clm - 1] === 0
                    || map[player.row - 1 - CHECK_DISTANCE][player.clm - 1] === 0)
            ) {
                movelist.push('up');
            }
            if (map[player.row][player.clm + player_size + 1] === 1
                && map[player.row + player_size][player.clm + player_size + 1] === 1) {
                movelist.push('right');
            }
            if (map[player.row + player_size + 1][player.clm] === 1
                && map[player.row + player_size + CHECK_DISTANCE][player.clm] === 1
                && map[player.row + player_size + 1][player.clm + player_size] === 1
                && map[player.row + player_size + CHECK_DISTANCE][player.clm + player_size] === 1
                && (map[player.row + player_size + 1][player.clm - 1] === 0
                    || map[player.row + player_size + CHECK_DISTANCE][player.clm - 1] === 0)
            ) {
                movelist.push('down');
            }
            break;
        case 'down':
            if (map[player.row][player.clm - 1] === 1
                && map[player.row][player.clm - CHECK_DISTANCE] === 1
                && map[player.row + player_size][player.clm - 1] === 1
                && map[player.row + player_size][player.clm - CHECK_DISTANCE] === 1
                && (map[player.row - 1][player.clm - 1] === 0
                    || map[player.row - 1][player.clm - CHECK_DISTANCE] === 0)
            ) {
                movelist.push('left');
            }
            if (map[player.row][player.clm + player_size + 1] === 1
                && map[player.row][player.clm + player_size + CHECK_DISTANCE] === 1
                && map[player.row + player_size][player.clm + player_size + 1] === 1
                && map[player.row + player_size][player.clm + player_size + CHECK_DISTANCE] === 1
                && (map[player.row - 1][player.clm + player_size + 1] === 0
                    || map[player.row - 1][player.clm + player_size + CHECK_DISTANCE] === 0)
            ) {
                movelist.push('right');
            }
            if (map[player.row + player_size + 1][player.clm] === 1
                && map[player.row + player_size + 1][player.clm + player_size] === 1) {
                movelist.push('down');
            }
            break;
        default:
            if (map[player.row - 1][player.clm] === 1
                && map[player.row - 1][player.clm + player_size] === 1
                && pre_move !== 'down') {
                movelist.push('up');
            }
            if (map[player.row][player.clm - 1] === 1
                && map[player.row + player_size][player.clm - 1] === 1
                && pre_move !== 'right') {
                movelist.push('left');
            }
            if (map[player.row][player.clm + player_size + 1] === 1
                && map[player.row + player_size][player.clm + player_size + 1] === 1
                && pre_move !== 'left') {
                movelist.push('right');
            }
            if (map[player.row + player_size + 1][player.clm] === 1
                && map[player.row + player_size + 1][player.clm + player_size] === 1
                && pre_move !== 'up') {
                movelist.push('down');
            }
    }
    return movelist;
};

function movePlayer(map, new_player, move) {
    switch (move) {
        case 'up':
            if (map[new_player.row - 1][new_player.clm] === 1) {
                new_player.row = new_player.row - 1;
            }
            break;
        case 'left':
            if (map[new_player.row][new_player.clm - 1] === 1) {
                new_player.clm = new_player.clm - 1;
            }
            break;
        case 'right':
            if (map[new_player.row][new_player.clm + 1] === 1) {
                new_player.clm = new_player.clm + 1;
            } break;
        case 'down':
            if (map[new_player.row + 1][new_player.clm] === 1) {
                new_player.row = new_player.row + 1;
            } break;
        default:
            console.log('error move= ' + move);
    }
    new_player.pre_move = move;
    return new_player;
};

function movePlayer_btn(map, player, btn) {
    switch (btn) {
        case 'up':
            if (map[player.row - 1][player.clm] === 1
                && map[player.row - 1][player.clm + player_size] === 1) {
                player.row = player.row - 1;
            }
            break;
        case 'left':
            if (map[player.row][player.clm - 1] === 1
                && map[player.row + player_size][player.clm - 1] === 1) {
                player.clm = player.clm - 1;
            }
            break;
        case 'right':
            if (map[player.row][player.clm + player_size + 1] === 1
                && map[player.row + player_size][player.clm + player_size + 1] === 1) {
                player.clm = player.clm + 1;
            }
            break;
        case 'down':
            if (map[player.row + player_size + 1][player.clm] === 1
                && map[player.row + player_size + 1][player.clm + player_size] === 1) {
                player.row = player.row + 1;
            }
            break;
        default:
            console.log('error btn= ' + btn);
    }
    return player;
};

function movePlayer_key(map, player, key) {
    switch (key) {
        case 38: // Key[↑]
            if (map[player.row - 1][player.clm] === 1
                && map[player.row - 1][player.clm + player_size] === 1) {
                player.row = player.row - 1;
            }
            break;
        case 37: // Key[←]
            if (map[player.row][player.clm - 1] === 1
                && map[player.row + player_size][player.clm - 1] === 1) {
                player.clm = player.clm - 1;
            }
            break;
        case 39: // Key[→]
            if (map[player.row][player.clm + player_size + 1] === 1
                && map[player.row + player_size][player.clm + player_size + 1] === 1) {
                player.clm = player.clm + 1;
            }
            break;
        case 40: // Key[↓]
            if (map[player.row + player_size + 1][player.clm] === 1
                && map[player.row + player_size + 1][player.clm + player_size] === 1) {
                player.row = player.row + 1;
            }
            break;
        default:
            console.log('error key= ' + key);
    }
    return player;
};

function showBtn() {
    $('#btn').css({ display: 'inline-block' });
    $('#btn_auto').css({ display: 'inline-block' });
}

function displayLoad(size, map, player) {
    $('#meiro').empty();
    var str = "";
    for (var i = 0; i < size; i++) {
        var str_i = String(getdoubleDigestNumer(i));
        const line = map[i];
        const length = line.length;
        str += '<div class="block">';
        for (var n = 0; n < length; n++) {
            var str_n = String(getdoubleDigestNumer(n));
            if (line[n] === 1) {
                if (i === player.row && n === player.clm
                    || i === player.row && n === player.clm + player_size
                    || i === player.row + player_size && n === player.clm
                    || i === player.row + player_size && n === player.clm + player_size) {
                    str += '<div ' + 'id=id' + str_i + str_n + ' class="p z">';
                } else {
                    str += '<div ' + 'id=id' + str_i + str_n + ' class="p">';
                }
            } else {
                str += '<div ' + 'id=id' + str_i + str_n + ' class="w">';
            }


            str += '</div>';
        }
        str += '</div>';
        $('#meiro').append(str);
        str = "";
    }
    for (var j = 0; j < start.length; j++) {
        $('#id' + start[j]).addClass('s');
    }
    for (var j = 0; j < end.length; j++) {
        $('#id' + end[j]).addClass('e');
    }
}

function displayLoad_bunshin(size, map, players) {
    $('#meiro').empty();
    if (players.length === 0) {
        console.log('ゴールできませんでした');
        return true;
    }
    var str = "";
    for (var i = 0; i < size; i++) {
        var str_i = String(getdoubleDigestNumer(i));
        const line = map[i];
        const length = line.length;
        str += '<div class="block">';
        for (var n = 0; n < length; n++) {
            var str_n = String(getdoubleDigestNumer(n));
            if (line[n] === 1) {
                //playerがいる場所
                for (var j = 0; j < players.length; j++) {
                    var player = players[j];
                    var str_ply = '';
                    if (i === player.row && n === player.clm
                        || i === player.row && n === player.clm + player_size
                        || i === player.row + player_size && n === player.clm
                        || i === player.row + player_size && n === player.clm + player_size) {
                        str_ply = '<div ' + 'id=id' + str_i + str_n + ' class="p z">';
                        break;
                    } else {
                        str_ply = '<div ' + 'id=id' + str_i + str_n + ' class="p">';
                    }
                }
                str += str_ply;
            } else {
                str += '<div ' + 'id=id' + str_i + str_n + ' class="w">';
            }
            str += '</div>';
        }
        str += '</div>';
        $('#meiro').append(str);
        str = "";
    }
    for (var j = 0; j < start.length; j++) {
        $('#id' + start[j]).addClass('s');
    }
    for (var j = 0; j < end.length; j++) {
        $('#id' + end[j]).addClass('e');
    }
}

function setStartEnd(click_id) {
    var list = [];
    // var pos = { row: 0, clm: 0 };
    //クリックしたポジション
    var pos_row = Number(click_id.substr(2, 2));
    var pos_clm = Number(click_id.substr(4, 2));

    //8方向の壁までの距離をチェック
    var dist = { north: 0, north_east: 0, east: 0, south_east: 0, south: 0, south_west: 0, west: 0, north_west: 0 };

    //北
    for (var i = 1; i < 100; i++) {
        if (map[pos_row - i][pos_clm] === 1) {
            dist.north = i;
        } else {
            break;
        }
    }

    //北東
    for (var i = 1; i < 100; i++) {
        if (map[pos_row - i][pos_clm + i] === 1) {
            dist.north_east = i;
        } else {
            break;
        }
    }
    //東
    for (var i = 1; i < 100; i++) {
        if (map[pos_row][pos_clm + i] === 1) {
            dist.east = i;
        } else {
            break;
        }
    }
    //南東
    for (var i = 1; i < 100; i++) {
        if (map[pos_row + i][pos_clm + i] === 1) {
            dist.south_east = i;
        } else {
            break;
        }
    }
    //南
    for (var i = 1; i < 100; i++) {
        if (map[pos_row + i][pos_clm] === 1) {
            dist.south = i;
        } else {
            break;
        }
    }
    //南西
    for (var i = 1; i < 100; i++) {
        if (map[pos_row + i][pos_clm - i] === 1) {
            dist.south_west = i;
        } else {
            break;
        }
    }
    //西
    for (var i = 1; i < 100; i++) {
        if (map[pos_row][pos_clm - i] === 1) {
            dist.west = i;
        } else {
            break;
        }
    }
    //北西
    for (var i = 1; i < 100; i++) {
        if (map[pos_row - i][pos_clm - i] === 1) {
            dist.north_west = i;
        } else {
            break;
        }
    }

    var tate = dist.north + dist.south + 1;
    var yoko = dist.east + dist.west + 1;
    var naname1 = dist.north_east + dist.south_west + 5;
    var naname2 = dist.north_west + dist.south_east + 5;
    var kijun = '';

    if (tate <= yoko) {
        if (tate <= naname1) {
            if (tate <= naname2) {
                kijun = 'tate';
            } else {
                kijun = 'naname2';
            }
        } else {
            if (naname1 <= naname2) {
                kijun = 'naname1';
            } else {
                kijun = 'naname2';
            }
        }
    } else {
        if (yoko <= naname1) {
            if (yoko <= naname2) {
                kijun = 'yoko';
            } else {
                kijun = 'naname2';
            }
        } else {
            if (naname1 <= naname2) {
                kijun = 'naname1';
            } else {
                kijun = 'naname2';
            }
        }
    }

    switch (kijun) {
        case 'tate':
            if (player_size === 0 && tate > 1) {
                player_size = tate - PLAYSER_SIZE_HOSEI;
            } else if (player_size === 0) {
                player_size = tate;
            }
            for (var j = 0; j < tate; j++) {
                list.push(createPositionId(pos_row, pos_clm + j));
                // list = addPos(list, pos_row, pos_clm + j);
            }
            for (var i = 1; i < 100; i++) {
                if (map[pos_row - i][pos_clm] === 1) {
                    list.push(createPositionId(pos_row - i, pos_clm));
                    // list = addPos(list, pos_row - i, pos_clm);
                    for (var j = 1; j < tate; j++) {
                        list.push(createPositionId(pos_row - i, pos_clm + j));
                        // list = addPos(list, pos_row - i, pos_clm + j);
                    }
                } else {
                    break;
                }
            }
            for (var i = 1; i < 100; i++) {
                if (map[pos_row + i][pos_clm] === 1) {
                    list.push(createPositionId(pos_row + i, pos_clm));
                    // list = addPos(list, pos_row + i, pos_clm);
                    for (var j = 1; j < tate; j++) {
                        list.push(createPositionId(pos_row + i, pos_clm + j));
                        // list = addPos(list, pos_row + i, pos_clm + j);
                    }
                } else {
                    break;
                }
            }
            break;
        case 'yoko':
            if (yoko > 1 && player_size === 0) {
                player_size = yoko - PLAYSER_SIZE_HOSEI;
            } else if (player_size === 0) {
                player_size = yoko;
            }
            for (var j = 0; j < yoko; j++) {
                list.push(createPositionId(pos_row + j, pos_clm));
                // list = addPos(list, pos_row + j, pos_clm);
            }
            for (var i = 1; i < 100; i++) {
                if (map[pos_row][pos_clm - i] === 1) {
                    list.push(createPositionId(pos_row, pos_clm - i));
                    // list = addPos(list, pos_row, pos_clm - i);
                    for (var j = 1; j < yoko; j++) {
                        list.push(createPositionId(pos_row + j, pos_clm - i));
                        // list = addPos(list, pos_row + j, pos_clm - i);
                    }
                } else {
                    break;
                }
            }
            for (var i = 1; i < 100; i++) {
                if (map[pos_row][pos_clm + i] === 1) {
                    list.push(createPositionId(pos_row, pos_clm + i));
                    // list = addPos(list, pos_row, pos_clm + i);
                    for (var j = 1; j < yoko; j++) {
                        list.push(createPositionId(pos_row + j, pos_clm + i));
                        // list = addPos(list, pos_row + j, pos_clm + i);
                    }
                } else {
                    break;
                }
            }
            break;
        case 'naname1':
            alert('もう一度選択してください');
            console.log('tate:' + tate);
            console.log('yoko:' + yoko);
            console.log('naname1:' + naname1);
            console.log('naname2:' + naname2);
            console.log('北東:' + dist.north_east);
            console.log('南西:' + dist.south_west);
            break;

            console.log('北東:' + dist.north_east);
            console.log('南西:' + dist.south_west);

            //北側を塗りつぶし
            for (var i = 0; i < dist.north_east + 1; i++) {
                //東側を塗りつぶし
                for (var j = 0; j < dist.north_east + 1; j++) {
                    // list.push(createPositionId(pos_row - i, pos_clm - j));
                }
                //西側を塗りつぶし
                for (var j = 0; j < dist.south_west + 1; j++) {
                    // list.push(createPositionId(pos_row - i, pos_clm - j));
                }
            }

            //南側を塗りつぶし
            for (var i = 1; i < dist.south_west + 1; i++) {
                //東側を塗りつぶし
                for (var j = 0; j < dist.north_east + 1; j++) {
                    // list.push(createPositionId(pos_row + i, pos_clm - j));
                }
                //西側を塗りつぶし
                for (var j = 0; j < dist.south_west + 1; j++) {
                    // list.push(createPositionId(pos_row + i, pos_clm - j));
                }
            }

            break;
        case 'naname2':
            alert('もう一度選択してください');
            console.log('tate:' + tate);
            console.log('yoko:' + yoko);
            console.log('naname1:' + naname1);
            console.log('naname2:' + naname2);
            break;
            console.log('北西:' + dist.north_west);
            console.log('南東:' + dist.south_east);

            //北側を塗りつぶし
            for (var i = 0; i < dist.north_west + 1; i++) {
                //東側を塗りつぶし
                for (var j = 0; j < dist.south_east + 1; j++) {
                    // list.push(createPositionId(pos_row - i, pos_clm - j));
                }
                //西側を塗りつぶし
                for (var j = 0; j < dist.north_west + 1; j++) {
                    // list.push(createPositionId(pos_row - i, pos_clm - j));
                }
            }

            //南側を塗りつぶし
            for (var i = 1; i < dist.south_east + 1; i++) {
                //東側を塗りつぶし
                for (var j = 0; j < dist.south_east + 1; j++) {
                    // list.push(createPositionId(pos_row + i, pos_clm - j));
                }
                //西側を塗りつぶし
                for (var j = 0; j < dist.north_west + 1; j++) {
                    // list.push(createPositionId(pos_row + i, pos_clm - j));
                }
            }
            break;
        default:
            console.log('error');
    }

    // console.log('tate:' + tate);
    // console.log('yoko:' + yoko);
    // console.log('naname1:' + naname1);
    // console.log('naname2:' + naname2);

    // console.log(list);
    return list;
}

function addPos(list, pos_row, pos_clm) {
    var pos = { row: pos_row, clm: pos_clm };
    list.push(pos);
    return list;
}

function shuffleList(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var r = Math.floor(Math.random() * (i + 1));
        var tmp = array[i];
        array[i] = array[r];
        array[r] = tmp;
    }
    return array;
};


function dragFile() {
    // Setup the dnd listeners.
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);

    function handleFileSelect(evt) {
        var img;

        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';

        files = evt.dataTransfer.files; // FileList object.
        // console.log(files);
        var file = files[0];
        var reader = new FileReader();
        //dataURL形式でファイルを読み込む
        reader.readAsDataURL(file);
        //ファイルの読込が終了した時の処理
        reader.onload = function () {
            // readImage(reader);
            var result_DataURL = reader.result;
            pre_userimage_url = reader.result;
            img = new Image();
            img.onload = function () {
                /*読み込み終了後ここで画像を加工して表示する*/
            }
            //読み込んだ画像ソースを入れる
            img.src = reader.result;

            $('#drop_image').attr('src', result_DataURL);
            $("#drop_image").css({ display: 'inline' });
            $("#drop_msg").css({ display: 'none' });
            $("#drop_zone").css({ border: '2px dashed #ff8952' });
        }
    }
}

function readImage(reader) {
    //ファイル読み取り後の処理
    var result_DataURL = reader.result;
    //読み込んだ画像とdataURLを書き出す
    // var img = document.getElementById('drop_image');
    $('#drop_image').attr('src', result_DataURL);
    $("#drop_image").css({ display: 'inline' });
    $("#drop_msg").css({ display: 'none' });
    $("#drop_zone").css({ border: '2px dashed #ff8952' });
    $("#icon_image").css({ display: 'inline' });
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function createMeiro() {
    var data = createImageData(document.getElementById('drop_image'));
    document.getElementById('test_canvas').getContext('2d').putImageData(data, 0, 0);
    processImageData(data);
}

function createImageData(img) {
    var cv = document.createElement('canvas');
    var ct = cv.getContext('2d');

    cv.width = img.naturalWidth;
    cv.height = img.naturalHeight;
    // cv.width = CANVAS_SIZE;
    // cv.height = CANVAS_SIZE;

    ct.drawImage(img, 0, 0, cv.width, cv.height, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    var data = ct.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    // console.log(data.data);
    image = data;
    return data;
}

function processImageData() {
    var width = CANVAS_SIZE;
    var height = CANVAS_SIZE;

    var canvas = document.getElementById("test_canvas");

    if (canvas.getContext) {
        // コンテキストの取得
        var ctx = canvas.getContext("2d");
        var red = [];
        var img_data = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        for (var y = 0; y < height; y++) {
            var red_x = [];
            var val = 0;
            for (var x = 0; x < width; x++) {
                var index = (y * CANVAS_SIZE * 4) + x * 4;
                if (img_data.data[index] > THRESHHOLD) {
                    val = 1;
                } else {
                    val = 0;
                }
                red_x.push(val);
            }
            red.push(red_x);
        }
        map = red;
        var parts_list = makePartsList(red);
        displaySVG(parts_list);
        displayAFRAME(parts_list);

        // console.log(map);
        size = map.length;
        // displayLoad(size, map, player)
    }
    $('#btn').css({ display: 'inline' });
}

function makePartsList(map) {
    var x_cnt = 0;
    // var y_cnt = 0;
    var parts = { x: 0, y: 0, width: 1, height: 0, type: '' }
    const parts_list = [];

    // console.log(map);
    for (var y = 0; y < map.length; y++) {
        parts = { x: 0, y: y, width: 1, height: 1, type: '' }
        const map_x = map[y];
        for (var x = 0; x < map_x.length; x++) {
            if (x === 0) {
                x_cnt += 1;
                parts.x = 0;
                if (map_x[x] === 1) {
                    parts.type = 'pass';
                } else {
                    parts.type = 'wall';
                }
            } else {
                if (x === map_x.length - 1) {
                    if (parts.type === '') {
                        if (map_x[x] === 1) {
                            parts.type = 'pass';
                        } else {
                            parts.type = 'wall';
                        }
                    }
                    x_cnt += 1;
                    parts.width = x_cnt;
                    parts_list.push(parts);
                    x_cnt = 0;
                } else {
                    if (map_x[x] === map_x[x - 1]) {
                        x_cnt += 1;
                    } else {
                        parts.width = x_cnt;
                        parts_list.push(parts);

                        // x_cnt += 1;

                        x_cnt = 0;
                        parts = { x: x, y: y, width: 1, height: 1, type: '' };
                        if (map_x[x] === 1) {
                            parts.type = 'pass';
                        } else {
                            parts.type = 'wall';
                        }
                    }
                }
            }
            // parts_list.push(parts);
        }
    }

    // console.log(parts_list);
    // return parts_list;

    //キャラの通り道を作成

    const pass_list = [];

    for (var i = 0; i < parts_list.length; i++) {
        var parts = parts_list[i];
        if (parts.type === 'pass') {
            pass_list.push(parts);
        }
    }

    pass_list.sort(function (a, b) {
        if (a.x < b.x) return -1;
        if (a.x > b.x) return 1;
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
        return 0;
    });

    for (var i = 0; i < pass_list.length - 1; i++) {
        var pass1 = pass_list[i];
        var pass2 = pass_list[i + 1];
        var pass_y_dif = pass2.y - pass1.y;
        var pass_w_dif = Math.abs(pass2.width - pass1.width);

        if (pass_y_dif === pass1.height && pass_w_dif <= 2) {
            pass_list[i].height += 1;
            pass_list.splice(i + 1, 1);
            i = i - 1;
        }
    }

    pass_list.sort(function (a, b) {
        if ((a.x + a.width) < (b.x + b.width)) return 1;
        if ((a.x + a.width) > (b.x + b.width)) return -1;
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
        return 0;
    });

    for (var i = 0; i < pass_list.length - 1; i++) {
        var pass1 = pass_list[i];
        var pass2 = pass_list[i + 1];
        var pass1_area = pass1.width * pass1.height;
        var pass_y_dif = pass2.y - pass1.y;
        var pass_h_dif = pass1.height - pass2.height;
        var pass_w_dif = Math.abs(pass1.width - pass2.width);
        if (pass_y_dif === pass1.height && pass_w_dif <= 2) {
            if (pass_w_dif !== 0 && pass1.width >= 0) {
                pass_list[i].width = pass1.width;
            } else {
                pass_list[i].width = pass2.width;
            }
            pass_list[i].height += pass2.height;
            pass_list.splice(i + 1, 1);
            i = i - 1;
        }
        if (pass1_area <= CANVAS_SMALL_LIMIT) {
            pass_list.splice(i, 1);
            i = i - 1;
        }
    }

    var avg = calcurateAverageThickness(pass_list);

    for (var i = 0; i < pass_list.length; i++) {
        var pass = pass_list[i];
        if (pass.width > pass.height) {
            pass.y = Math.ceil(pass.y + pass.height / 2);
            pass.height = 1;
        } else {
            pass.x = Math.ceil(pass.x + pass.width / 2);
            pass.width = 1;
            pass.y = Math.ceil(pass.y - (avg / 2));
            pass.height = Math.ceil(pass.height + avg * 1.5);
        }
    }

    player_pass = pass_list;

    // return pass_list;

    // 壁のみでテスト------------------------------
    const wall_list = [];

    for (var i = 0; i < parts_list.length; i++) {
        var parts = parts_list[i];
        if (parts.type === 'wall') {
            wall_list.push(parts);
        }
    }

    wall_list.sort(function (a, b) {
        if (a.x < b.x) return -1;
        if (a.x > b.x) return 1;
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
        return 0;
    });

    for (var i = 0; i < wall_list.length - 1; i++) {
        var wall1 = wall_list[i];
        var wall2 = wall_list[i + 1];
        var wall_x_dif = wall1.x - wall2.x;
        var wall_y_dif = wall2.y - wall1.y;
        var wall_w_dif = Math.abs(wall2.width - wall1.width);

        if (wall_y_dif === wall1.height && wall_w_dif <= 2) {
            if (wall_w_dif < 0) {
                wall1.width = wall2.width;
            }
            wall_list[i].height += 1;
            wall_list.splice(i + 1, 1);
            i = i - 1;
        }
    }

    wall_list.sort(function (a, b) {
        if ((a.x + a.width) < (b.x + b.width)) return 1;
        if ((a.x + a.width) > (b.x + b.width)) return -1;
        if (a.y < b.y) return -1;
        if (a.y > b.y) return 1;
        return 0;
    });


    for (var i = 0; i < wall_list.length - 1; i++) {
        var wall1 = wall_list[i];
        var wall2 = wall_list[i + 1];
        var wall1_area = wall1.width * wall1.height;
        var wall_y_dif = wall2.y - wall1.y;
        var wall_h_dif = wall1.height - wall2.height;
        var wall_w_dif = Math.abs(wall1.width - wall2.width);
        if (wall_y_dif === wall1.height && wall_w_dif <= 2) {
            if (wall_w_dif !== 0 && wall1.width >= 0) {
                wall_list[i].width = wall1.width;
            } else {
                wall_list[i].width = wall2.width;
            }
            wall_list[i].height += wall2.height;
            wall_list.splice(i + 1, 1);
            i = i - 1;
        }
        if (wall1_area <= CANVAS_SMALL_LIMIT) {
            wall_list.splice(i, 1);
            i = i - 1;
        }
    }

    // console.log(wall_list);
    for (var i = 0; i < pass_list.length; i++) {
        wall_list.push(pass_list[i]);
    }
    // wall_list.push(parts_list);

    // ------------------------------    
    return wall_list;
}

function calcurateAverageThickness(list) {
    var sum = 0;
    for (var i = 0; i < list.length - 1; i++) {
        if (list[i].width <= list[i].height) {
            sum += list[i].width;
        } else {
            sum += list[i].height;
        }
    };

    var avg = Math.ceil(sum / list.length);
    return avg;
}

function displaySVG(parts_list) {
    $('#new_meiro').empty();
    var str = "";
    str += '<svg id="svg_meiro" width=' + CANVAS_SIZE * MAGNIFICATION + ' height=' + CANVAS_SIZE * MAGNIFICATION + ' viewBox="0 0 ' + CANVAS_SIZE * MAGNIFICATION + ' ' + CANVAS_SIZE * MAGNIFICATION + '">';

    for (var i = 0; i < parts_list.length; i++) {
        var parts = parts_list[i];
        if (parts.type !== 'pass') {
            str += '<rect x=' + parts.x * MAGNIFICATION + ' y=' + parts.y * MAGNIFICATION + ' width=' + parts.width * MAGNIFICATION + ' height=' + parts.height * MAGNIFICATION + ' fill="blue"></rect>';
        } else {
            str += '<rect x=' + parts.x * MAGNIFICATION + ' y=' + parts.y * MAGNIFICATION + ' width=' + parts.width * MAGNIFICATION + ' height=' + parts.height * MAGNIFICATION + ' fill="orange"></rect>';
        }
    }
    str += '</svg>';
    $('#new_meiro').append(str);
}

function displayAFRAME(parts_list) {
    $('#vr_meiro').empty();
    var str = "";
    str += '<a-scene id="a_meiro" embedded>';
    str += '<a-sky color="#DDDDDD"></a-sky>';
    str += '<a-box  width= ' + CANVAS_SIZE + ' height=2 ' + 'depth=' + CANVAS_SIZE + ' position="' + (CANVAS_SIZE / 2) + ' 0 ' + (CANVAS_SIZE / 2) + ' color="white" ></a-box>';
    str += '<a-entity id="a_camera" position="' + camera_position.x + ' ' + camera_position.y + ' ' + camera_position.z + '" rotation="-90 0 0">';
    str += '<a-camera></a-camera>';
    str += '</a-entity>';
    str += '<a-entity light="color: #FFF; intensity: 1.5" position="75 150 0"></a-entity>';

    for (var i = 0; i < parts_list.length; i++) {
        var parts = parts_list[i];
        // if (parts.type === 'pass') {
        //     str += '<a-box width= ' + parts.width + ' height="1" depth="1" position="' + (parts.x + parts.width / 2) + ' 0 ' + parts.y + '" color="white"></a-box>';
        // } else {
        //     str += '<a-box width= ' + parts.width + ' height="4" depth="1" position="' + (parts.x + parts.width / 2) + ' 2 ' + parts.y + '" color="blue"></a-box>';
        // }
        if (parts.type === 'wall') {
            str += '<a-box width= ' + parts.width + ' height="8"' + ' depth=' + parts.height + ' position="' + (parts.x + parts.width / 2) + ' 2 ' + (parts.y + parts.height / 2) + '" color="blue"></a-box>';
        }
    }
    // str += '<a-sphere id="sphere" color="#C0C0C0" radius="3" position="13 2 16" ></a-sphere>';
    str += '</a-scene>';
    $('#vr_meiro').append(str);
}

function getdoubleDigestNumer(number) {
    return ("0" + number).slice(-2);
};

function createPositionId(pos_row, pos_clm) {
    pos_row = getdoubleDigestNumer(pos_row);
    pos_clm = getdoubleDigestNumer(pos_clm);
    var pos = String(pos_row) + String(pos_clm);
    return pos;
};


function startVideo() {
    Promise.resolve()
        .then(function () {
            return navigator.mediaDevices.enumerateDevices();
        })
        .then(function (mediaDeviceInfoList) {
            console.log('使える入出力デバイスs->', mediaDeviceInfoList);

            var videoDevices = mediaDeviceInfoList.filter(function (deviceInfo) {
                return deviceInfo.kind == 'videoinput';
            });
            if (videoDevices.length < 1) {
                throw new Error('error');
            }

            return navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    deviceId: videoDevices[1].deviceId
                }
            });
        })
        .then(function (mediaStream) {
            console.log('MediaStream->', mediaStream);
            videoStreamInUse = mediaStream;
            document.querySelector('video').src = window.URL.createObjectURL(mediaStream);
            // 対応していればこっちの方が良い
            // document.querySelector('video').srcObject = mediaStream;
        })
        .catch(function (error) {
            console.error('error', error);
        });
}

function stopVideo() {
    videoStreamInUse.getVideoTracks()[0].stop();
    if (videoStreamInUse.active) {
        console.error('error', videoStreamInUse);
    } else {
        // console.log('停止できたよ！', videoStreamInUse);
    }
}

function snapshot() {
    //videoタグ取得
    var videocnt = $("#camera_zone");
    //canvas取得
    var canvas = $("#canvas")[0];
    canvas.width = videocnt.width();
    canvas.height = videocnt.height();
    var cnt2d = $("#canvas")[0].getContext('2d');
    //canvasに書き込み
    // cnt2d.drawImage(videocnt[0], 0, 0);
    cnt2d.drawImage(videocnt[0], 0, 0, 800, 800, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (canvas.getContext) {
        // コンテキストの取得
        // var ctx = canvas.getContext("2d");
        var red = [];
        var img_data = cnt2d.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        for (var y = 0; y < 100; y++) {
            var red_x = [];
            for (var x = 0; x < 100; x++) {
                var index = (y * CANVAS_SIZE * 4) + x * 4;
                red_x.push(img_data.data[index]);
            }
            red.push(red_x);
        }
    }
    size = CANVAS_SIZE;
    map = red;
    console.log(map);
    displayLoad(size, map, player);
}


var downloadCsv = (function () {

    var tableToCsvString = function (table) {
        var str = '\uFEFF';
        for (var i = 0, imax = table.length - 1; i <= imax; ++i) {
            var row = table[i];
            for (var j = 0, jmax = row.length - 1; j <= jmax; ++j) {
                str += row[j];
                if (j !== jmax) {
                    str += ',';
                }
            }
            str += '\n';
        }
        return str;
    };

    var createDataUriFromString = function (str) {
        return 'data:text/csv,' + encodeURIComponent(str);
    }

    var downloadDataUri = function (uri, filename) {
        var link = document.createElement('a');
        link.download = filename;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return function (table, filename) {
        if (!filename) {
            filename = 'output.csv';
        }
        var uri = createDataUriFromString(tableToCsvString(table));
        downloadDataUri(uri, filename);
    };

})();

class Player {
    constructor(id, x, y, size, pass_idx, direction, distance, root) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.size = size;
        this.pass_idx = pass_idx;
        this.direction = direction;
        this.distance = distance;
        this.root = root;
    }
    set id(id) {
        this._id = id;
    }
    get id() {
        return this._id;
    }
    set y(y) {
        this._y = y;
    }
    get y() {
        return this._y;
    }
    set size(size) {
        this._size = size;
    }
    get size() {
        return this._size;
    }
    set direction(direction) {
        this._direction = direction;
    }
    get direction() {
        return this._direction;
    }
    set distance(distance) {
        this._distance = distance;
    }
    get distance() {
        return this._distance;
    }
    set pass_idx(pass_idx) {
        this._pass_idx = pass_idx;
    }
    get pass_idx() {
        return this._pass_idx;
    }
    set root(root) {
        this._root = root;
    }
    get root() {
        return this._root;
    }
}