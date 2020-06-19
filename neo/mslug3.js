"use strict"

var palsetAddress = [
	0x2E152, 0x2E152, 0x2E152, 
	0x2E67E, 0x2E67E, 0x2E67E, 
	//0x545D4, 0xC8374, 0xCAEAA, 0x55482, 0x566CA, 0x57CEC, 0x545D4, 0x4E226, 0x545D4
];

// load pal from rom and oveewrite old
function loadRomPal() {
	var bf = new bytebuffer(romFrameData);

	mslugPalette(0x4626);		// ROM:000046CE
	mslugPalette(0x46A8);		// ROM:0000470E
	mslugPalette(palsetAddress[palset]);

	// palette_empty = 0x60

	// var playerPalette = 0x90E54;

	// mslugPalette2(bf.getuShort(playerPalette));
	// mslugPalette2(bf.getuShort(playerPalette + 2));
	// mslugPalette2(bf.getuShort(playerPalette + 4));
	// mslugPalette2(bf.getuShort(playerPalette + 6));

	// mslugPalette2(0x125);
	// mslugPalette2(0x3BE);

	// mslugPalette2(0x7A);
	// mslugPalette2(0x7C);
	// mslugPalette2(0x7E);
	// mslugPalette2(0x80);

	// mslugPalette2(0x38D);
	// mslugPalette2(0x3AA);
	// mslugPalette2(0x200);
	
	if(showPal)
		drawPal();
}

function mslugPalette(addr) {
	var rombase = unscramble(0x0904);
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);

	for(let p = 0;p < 0x100;p++) {
		let idx2 = bf.getuShort(addr);		// write to
		if(idx2 == 0xFFFF) {
			break;
		}
		let idx = bf.getShort(addr + 2);		// write from
		idx <<= 5;
		let addr2 = 0x200000 + idx + rombase;
		bf2.position(addr2);

		let to = idx2 * 0x10;
		palData[to] = 0;
		bf2.skip(2);

		for(let i = 0;i < 15;i++) {
			let dt = bf2.getuShort() << 1;
			if(dt > 0x8000) {	// signed because ROM:000809EE    move.w  (a3,d0.w),(a4)+
				dt -= 0x10000;
			}
			let addr3 = 0x220000 + dt + rombase;		
			let color = bf.getuShort(addr3);
			palData[i + to + 1] = neo2rgb(color);
		}
		addr += 6;
	}

}

var palette_empty = 0x60;
// palette not fixed in position
function mslugPalette2(addr) {
	var rombase = unscramble(0x05BA);
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);

	let idx = addr;		// write from
	idx <<= 5;
	let addr2 = 0x200000 + idx + rombase;
	bf2.position(addr2);

	let to = palette_empty * 0x10;
	palData[to] = 0;
	bf2.skip(2);

	for(let i = 0;i < 15;i++) {
		let dt = bf2.getuShort() << 1;
		if(dt > 0x8000) {	// signed because ROM:000809EE    move.w  (a3,d0.w),(a4)+
			dt -= 0x10000;
		}
		let addr3 = 0x214000 + dt + rombase;		
		let color = bf.getuShort(addr3);
		palData[i + to + 1] = neo2rgb(color);
	}


	palette_empty++;
}

function movetoTile(tile) {
	curStartTile = tile;
	refresh()
}

var animAddress = [
	0x703AC, 0x2EB1C2, 0x96570, 0x2F2112, 0xBDC74, 0x46B78, 0x46EDE, 0x4735C, 0x47200,
	0xC2F8, 0x68818, 0x688CC, 0x4A730, 0xC0BCA, 0xC12AC, 0x73DCC, 0x65CDA, 0x69E64,
	0x5442E, 0x54384, 0x42DE8, 0xA22BC
];
var curAnim;	// current animation index
var curAnimAct;	// current animation index
// show object animation from rom address
var animTimer;
function drawAnimation(addr) {
//	let addr = animAddress[curAnim];
	var bf = new bytebuffer(romFrameData);
	if(!addr)
		addr = animAddress[curAnim];

	if(animTimer) {
		clearTimeout(animTimer)
		animTimer = null;
	}
	

	loopDrawAnimation(addr);
}
function loopDrawAnimation(addr, offset = 0xA) {
	animTimer = null;

	var bf = new bytebuffer(romFrameData, addr);
	let animfunc = bf.get();
	if(animfunc != 4) {
		labelInfo.innerText = 'anim:' + (addr).toString(16).toUpperCase() + ' func:' + animfunc.toString(16).toUpperCase();
		return;
	}
	let tmp = bf.get();	// 40, 44?
	tmp = bf.get();	// 0, FC?
	tmp = bf.get();	// 0?
	let addr2 = bf.getInt();
	let frame = getRomFrame(addr2);
	if(!frame) {
		return;
	}
	labelInfo.innerText = 'anim:' + (addr).toString(16).toUpperCase();

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawRomFrameBase(frame);
	addr += offset;

	animTimer = setTimeout("loopDrawAnimation("+ addr +"," + offset+")", 200);
}

function drawAnimationFrame(addr, c = ctx, offx = 128, offy = 160, cbbase = 0x103000) {

}


var mapAddress = [
	0x2E01C, 0x2E066, 0x2E0B0,
	0x2E560, 0x2E5BE, 0x2E622,
	//0x54574, 0xC82AC, 0xCAC6A, 0x55452, 0x56638, 0x58BD6, 0x549A2, 0x4E1D0, 0xC7A5A
];
var map2Address = 0x1923A;	// layer 2 background

let mapWidth = 32;
let mapHeight;	// default 8
let mapGrid = 2;		// each map tile contains 4 raw tiles?
// draw a background with tilemap

var autoAnim = 0;

function drawMap() {
	palset = curMap;
	loadRomPal();

	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	let addr = mapAddress[curMap] + mapScene * 12;	// mapAddressSkip

	ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
	var imageData = ctxBack.createImageData(gridWidth, gridHeight);

	bf.position(addr);
	let addr2 = (bf.getShort() << 3) + 0x1002;
	let page = bf.getuShort(addr2);	// memory page
	debugger
	let addr3 = bf.getInt(addr2 + 2) + unscramble(page);
	let offset = bf.getuShort();
	bf.skip(4);
	let x = bf.getShort();
	let h = bf.getShort();
	if(h > 0x100) {	// too 
		debugger;
		return;
	}

	labelInfo.innerText += ' height:'+h;

	bf2.position(addr3 + offset);
	bf2.skip(4 * h * mapAddressSkip);

	for(let i = 0;i < 32;i++) {
		for(let j = 0;j < h;j++) {
			let tile = bf2.getuShort();
			let pal = bf2.get();
			let flag = bf2.get();
			tile += (flag & 0xF0) << 12;
			let a8 = flag & 0b1000;	// 8 frame auto animation
			let a4 = flag & 0b0100;	// 4 frame auto animation
			if(a8) {
				tile += (autoAnim & 0x7);
			} else if(a4) {
				tile += (autoAnim & 0x3);
			}
			drawTilesBase(imageData, tile, 1, 1, pal, 16, false, (flag & 0x2), (flag & 0x1), false);

			ctxBack.putImageData(imageData, i * gridHeight, j * gridWidth - mapAddressSkipY * 32);
		}
	}

	autoAnim++;
}


var map2Data = [
	
];
let map2Width = 16;
let map2Height = 8;
function drawMap2() {
}

function setMapTileStart(mapstart) {
	mapScene = mapstart;
	refresh();
}


frameAddress = [		// bp 331C get D4
	0x15D648, 0x15D3C8, 0x15D744, 0x15D77C, 0x11F222, 0x100000, 0x156D42, 0x1568D6, 0x156902, 0x144E92, 0x10083C, 0x10088C, 
	0x19BD88, 0x163EFA, 0x166560, // 0x106670, 0x100040, 0x103BF2, 0x148B5A, 0x16C9DE, 0x16CA2E
	// 0x3F3D, 0x3F3E, 0x36DD, 0x1525, 0x68F, 0x68C, 0x695, 0x692, 0x1B2A, 0x1B2C, 0x1B32, 0x2CBD
];

// get frame from addr. return a frame obj
function getRomFrame(addr, f = 0) {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	let frame = {
		sprites: [],
	};
	

	// draw by $8544
	// if(f >= 0) {	// use frameAddress and has multiple frames
	// 	addr = bf.getInt(addr - 0x100000 + f * 4);
	// 	addr = bf.getShort(addr - 0x100000 + 4);
	// }
	
	frame.info = '0x'+addr.toString(16).toUpperCase();

	bf.position(addr);
	let cnt = bf.get();	// sprite count
	if(cnt > 0x10) {
		debugger;
		return;
	}
	let flag = bf.get();
	let palette = 0x60;

	for(let c = 0;c < cnt;c++) {
		
		let x = bf.getShort();
		let y = -bf.getShort();
		let nx = bf.get();
		let ny = bf.get();
		//let d0 = bf.getuShort();
	
		for(let i = 0;i < nx;i++) {
			for(let j = 0;j < ny;j++) {
				let tile = bf.getuShort() + ((flag & 0xF0) << 12);
				let sprite = {
					x: (i << 4) + x,
					y: (j << 4) + y,
					tile: tile,
					nx: 1,
					ny: 1,
					vflip: flag & 0x2,	// this tile need flip
					hflip: flag & 0x1,	// this tile need flip
					pal: palette,
				};
				frame.sprites.push(sprite);
			}
		}
	}

	return frame;
}

var animPlayerAddr = [];

var palmap = [

];

function loadRomFrame() {
	// var bf = new bytebuffer(romFrameData);
	
	// for(let i = 0;i < 21;i++) {
	// 	let addr = bf.getInt(0x120280 + i * 4);
	// 	frameAddress.push(addr);
	// 	// if(palmap[i])
	// 	// 	spritePaletteMap.set(addr, palmap[i]);
	// }
}


function unscramble(sel) {
	var bankoffset =
	[
		0x000000, 0x020000, 0x040000, 0x060000, // 00
		0x070000, 0x090000, 0x0b0000, 0x0d0000, // 04
		0x0e0000, 0x0f0000, 0x120000, 0x130000, // 08
		0x140000, 0x150000, 0x180000, 0x190000, // 12
		0x1a0000, 0x1b0000, 0x1e0000, 0x1f0000, // 16
		0x200000, 0x210000, 0x240000, 0x250000, // 20
		0x260000, 0x270000, 0x2a0000, 0x2b0000, // 24
		0x2c0000, 0x2d0000, 0x300000, 0x310000, // 28
		0x320000, 0x330000, 0x360000, 0x370000, // 32
		0x380000, 0x390000, 0x3c0000, 0x3d0000, // 36
		0x400000, 0x410000, 0x440000, 0x450000, // 40
		0x460000, 0x470000, 0x4a0000, 0x4b0000, // 44
		0x4c0000, // rest not used?
	];

	// unscramble bank number
	let data =
		(BIT(sel, 14) << 0)+
		(BIT(sel, 12) << 1)+
		(BIT(sel, 15) << 2)+
		(BIT(sel,  6) << 3)+
		(BIT(sel,  3) << 4)+
		(BIT(sel,  9) << 5);

	return -0x100000 + bankoffset[data];
}

function BIT(sel, n) {
	return (sel >> n) & 1;
}