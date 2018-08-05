

const CLICK_INTERVAL = 100;

var image;

$(function () {
    var players = [];
    var size = 0;
    var map = [];
    var finish = false;
    var auto = false;
    var player_name = [];
    var rows = [];
    var clms = [];

    console.log('start');

    dragFile();

    //canvas追加
    //キャンバスに画像をセット
    // var canvas = document.getElementById('drop_image');
    // //var canvas = document.createElement('canvas');
    // var context = canvas.getContext('2d');
    // var width = img.width;
    // var height = img.height;
    // canvas.width = width;
    // canvas.height = height;
    // context.drawImage(img, 0, 0);

    $('#create').on('click', function () {
        players = [];
        rows = [1];
        clms = [1];
        var new_rows = JSON.stringify(rows);
        var new_clms = JSON.stringify(clms);
        var player = { name: '', pre_move: '', row: 1, clm: 1, rows: new_rows, clms: new_clms };
        player.name = 'player1';
        players.push(player);
        finish = false;
        size = Number($('#size').val()) + 1;
        map = makeLoad(size);
        displayLoad(size, map, players);
        showBtn();
    });

    $('#check').on('click', function () {
        if (!finish) {
            var new_players = createAvatar();
            for (var i = 0; i < new_players.length; i++) {
                var new_player = new_players[i];
                displayLoad(size, map, new_players);
                finish = judgeGoal(new_player, size, map);
            }
        }
        test();
    });

    $('#auto').on('click', function () {
        auto = true;
        if (auto) {
            searchGoal();
        }
    });

    function searchGoal() {
        if (!finish) {
            var new_players = createAvatar();
            for (var i = 0; i < new_players.length; i++) {
                var new_player = new_players[i];
                displayLoad(size, map, new_players);
                // result = judgeGoal(new_player, size);
                finish = judgeGoal(new_player, size, map);
            }
        }
        if (auto) {
            setTimeout(function () { searchGoal() }, CLICK_INTERVAL);
        }
    }

    function createAvatar() {
        const new_players = [];
        for (var i = 0; i < players.length; i++) {
            const player = players[i];
            const movelist = checkDirection(map, player, player.pre_move);
            for (var n = 0; n < movelist.length; n++) {
                var new_player = { ...player };
                move = movelist[n];
                var new_rows = [];
                var new_clms = [];
                new_player = movePlayer(map, new_player, move);
                new_rows = JSON.parse(new_player.rows);
                new_clms = JSON.parse(new_player.clms);
                new_rows.push(new_player.row);
                new_clms.push(new_player.clm);
                new_player.rows = JSON.stringify(new_rows);
                new_player.clms = JSON.stringify(new_clms);
                new_players.push(new_player);
                new_player.name = 'player' + i;
            };
        }
        players = new_players;
        return new_players;
    }
});

function movePlayer(map, new_player, move) {
    switch (move) {
        case 'up':
            if (map[new_player.row - 1][new_player.clm] === 0) {
                new_player.row = new_player.row - 1;
            }
            break;
        case 'left':
            if (map[new_player.row][new_player.clm - 1] === 0) {
                new_player.clm = new_player.clm - 1;
            }
            break;
        case 'right':
            if (map[new_player.row][new_player.clm + 1] === 0) {
                new_player.clm = new_player.clm + 1;
            } break;
        case 'down':
            if (map[new_player.row + 1][new_player.clm] === 0) {
                new_player.row = new_player.row + 1;
            } break;
        default:
            console.log('error move= ' + move);
    }
    new_player.pre_move = move;
    return new_player;
};

function judgeGoal(player, size, map) {
    if (player.row === size - 2 && player.clm === size - 2) {
        console.log('GameClear');
        console.log(player);
        displayLoadtoGoal(player, size, map);
        return true;
    };
    return false;
}

function checkDirection(map, player, pre_move) {
    const movelist = [];
    if (map[player.row - 1][player.clm] === 0 && pre_move !== 'down') {
        movelist.push('up')
    }
    if (map[player.row][player.clm - 1] === 0 && pre_move !== 'right') {
        movelist.push('left')
    }
    if (map[player.row][player.clm + 1] === 0 && pre_move !== 'left') {
        movelist.push('right')
    }
    if (map[player.row + 1][player.clm] === 0 && pre_move !== 'up') {
        movelist.push('down')
    }
    if (movelist.length === 0) {
        // console.log('delete');
    }
    return movelist;
}


function showBtn() {
    $('#btn').css({ display: 'inline-block' });
    $('#btn_auto').css({ display: 'inline-block' });
}

function makeLoad(size) {
    if (size <= 10) {
        alert("10以上を入力してください");
        return;
    }
    $('#meiro').css({
        'height': size * 10 + 'px',
        'width': (size * 10) + 'px'
    });

    const map = [];
    for (var i = 0; i < size; i++) {
        const line = [];
        for (var n = 0; n < size; n++) {
            if (i === 0 || i === size - 1 || n === 0
                || n === size - 1 || n % 2 === 0 && i % 2 === 0) {
                line.push(1); //1が壁
            } else {
                line.push(0); //0が道    
            }
        }
        map.push(line);
    };
    // return map;

    //これ以降は棒倒し処理
    for (var r = 0; r < size; r++) { //rは行数
        if (r === 0 || (r + 1) === size) {
            continue;
        }
        if (r % 2 === 1) {
            continue;
        }

        const line = map[r];

        // 最初の行のみ、上下左右倒してOK（重なるのはNG）
        var direction = ['top', 'bottom', 'left', 'right'];
        if (r >= 4) {
            direction = direction.slice(1); //topを削除
        }
        for (var i = 0; i < line.length; i++) { //iは列数
            // 端っこは対象外
            if (i === 0 || (i + 1) === line.length || i % 2 === 1) {
                continue;
            }

            direction = shuffleList(direction);

            for (var j = 0; j < direction.length; j++) {
                if (direction[j] === "top") {
                    if (map[r - 1][i] === 0) {
                        map[r - 1][i] = 1;
                        break;
                    }
                }
                if (direction[j] === "left") {
                    if (map[r][i - 1] === 0) {
                        map[r][i - 1] = 1;
                        break;
                    }
                }
                if (direction[j] === "right") {
                    if (map[r][i + 1] === 0) {
                        map[r][i + 1] = 1;
                        break;
                    }
                }
                if (direction[j] === "bottom") {
                    if (map[r + 1][i] === 0) {
                        map[r + 1][i] = 1;
                        break;
                    }
                }
            }
        }
    }
    return map;
}

function displayLoadtoGoal(player, size, map) {
    var track_rows = [];
    var track_clms = [];
    track_rows = JSON.parse(player.rows);
    track_clms = JSON.parse(player.clms);
    var goal_player = {};
    const goal_players = [];
    for (var i = 0; i < track_rows.length; i++) {
        goal_player = { row: track_rows[i], clm: track_clms[i] };
        goal_players.push(goal_player);
    }
    displayLoad(size, map, goal_players);
}

function displayLoad(size, map, players) {
    $('#meiro').empty();
    var str = "";
    for (var i = 0; i < size; i++) {
        const line = map[i];
        const length = line.length;
        for (var n = 0; n < length; n++) {
            if (line[n] === 1) {
                str += '<div class="w">';
            } else if (i === 1 && n === 1) { //startポジション
                str += '<div class="p s">';
            } else if (i + 2 === size && n + 2 === length) { //endポジション
                str += '<div class="p e">';
            } else {
                str += '<div class="p">';
            }
            //playerがいる場所
            for (var j = 0; j < players.length; j++) {
                var player = players[j];
                if (i === player.row && n === player.clm) {
                    str += '◎'
                }
            }
            str += '</div>';
        }
        $('#meiro').append(str);
        str = "";
    }
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
        //ファイルの読込が終了した時の処理
        // anallizeImage(img);

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

function anallizeImage(img_data) {
    for (var y = 1; y < img_data.height - 1; y++) {
        for (var x = 1; x < img_data.width - 1; x++) {

            var r_sum = 0;
            var g_sum = 0;
            var b_sum = 0;

            // 周囲3*3ピクセルのRGB成分を合計
            for (var yy = y - 1; yy <= y + 1; yy++) {
                for (var xx = x - 1; xx <= x + 1; xx++) {
                    var index = (xx + yy * img_data.width) * 4;
                    r_sum += img_data.data[index];
                    g_sum += img_data.data[index + 1];
                    b_sum += img_data.data[index + 2];
                }
            }

            // RGB平均値を算出
            var r = r_sum / 9;
            var g = g_sum / 9;
            var b = b_sum / 9;

            console.log(r);
            console.log(g);
            console.log(b);

        }
    }
}

function test() {
    var data = createImageData(document.getElementById('drop_image'));
    document.getElementById('test_canvas').getContext('2d').putImageData(data, 0, 0);
    document.getElementById('test_canvas').addEventListener('click', processImageData);
}

function createImageData(img) {
    var natural = true;

    var cv = document.createElement('canvas');

    if (natural) {
        cv.width = img.naturalWidth;
        cv.height = img.naturalHeight;
    } else {
        cv.width = 256;
        cv.height = 256;
    }
    var ct = cv.getContext('2d');

    ct.drawImage(img, 0, 0);

    var data = ct.getImageData(0, 0, cv.width, cv.height);
    image = data;
    // $('#test_canvas').css({width:cv.width, height:cv.height});
    return data;

}

function processImageData() {
    var players = [];
    var rows = [5];
    var clms = [1];
    var new_rows = JSON.stringify(rows);
    var new_clms = JSON.stringify(clms);
    var player = { name: '', pre_move: '', row: 1, clm: 1, rows: new_rows, clms: new_clms };
    player.name = 'player1';
    players.push(player);

    var width = 100;
    var height = 100;

    var canvas = document.getElementById("test_canvas");

    if (canvas.getContext) {
        // コンテキストの取得
        var ctx = canvas.getContext("2d");
        // var image = document.getElementById("img_test");

        var red = [];

        var img_data = ctx.getImageData(0, 0, 100, 100);
        console.log(img_data.data)

        for (var y = 0; y < height; y++) {
            var red_x = [];
            for (var x = 0; x < width; x++) {
                var index = (y * 100 * 4) + x * 4;
                red_x.push(img_data.data[index]);
            }
            red.push(red_x);
        }
        console.log(red);

        displayLoad2(height, red, players)
    }
}

function displayLoad2(size, map, players) {
    $('#meiro').empty();
    var str = "";
    for (var i = 0; i < size; i++) {
        const line = map[i];
        const length = line.length;
        str += '<div class="block">';
        for (var n = 0; n < length; n++) {
            if (line[n] > 10) {
                str += '<div class="p">';
            } else if (i === 1 && n === 1) { //startポジション
                str += '<div class="p s">';
            } else if (i + 2 === size && n + 2 === length) { //endポジション
                str += '<div class="p e">';
            } else {
                str += '<div class="w">';
            }
            //playerがいる場所
            // for (var j = 0; j < players.length; j++) {
            //     var player = players[j];
            //     if (i === player.row && n === player.clm) {
            //         str += '◎'
            //     }
            // }
            str += '</div>';
        }
        str += '</div>';
        $('#meiro').append(str);
        str = "";
    }
}