"use strict"

var paletteAddress = 0xA8B48;		// per level * scen = 8 * 4
var paletteAddressIndex1 = 0x4D8C;	// for sprite, per level * scene = 8 * 10?
var paletteAddressIndex2 = 0x4D14;	// for scroll layer 1, seems fixed for HUD
var paletteAddressIndex3 = 0x4D3C;	// for scroll layer 2
var paletteAddressIndex4 = 0x4D64;

// load pal from rom and oveewrite old
function loadRomPal() {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	
	
	var paletteIndex = bf.getInt(paletteAddressIndex1 + palset * 4);	// palset = level
	var paletteIndex2 = bf.getInt(paletteAddressIndex2 + palset * 4);
	var paletteIndex3 = bf.getInt(paletteAddressIndex3 + palset * 4);
	var paletteIndex4 = 0x10B070 + palset * 0x400;
	labelInfo2.innerText = 'palset:' + palset +   ' palset2:' + palset2 + ' addr:' + paletteIndex.toString(16).toUpperCase();
	
	// load sprite palette
	bf.position(0x105470);
	for(let i = 0;i < 32;i++) {
		loadRomPalCps1(bf, (i << 4))
	}

	// load layer 2 & 3 palette
	bf.position(0x107C70 + palset * 0x400);
	for(let i = 0;i < 32;i++) {
		loadRomPalCps1(bf, (i << 4) + 1 * 16 * 32);
	}
	
	// load layer 2 & 3 palette
	bf.position(0x108470 + palset * 0x400);
	for(let i = 0;i < 32;i++) {
		loadRomPalCps1(bf, (i << 4) + 2 * 16 * 32);
	}
	
	bf.position(paletteIndex4);
	for(let i = 0;i < 32;i++) {
		loadRomPalCps1(bf, (i << 4) + 3 * 16 * 32);
	}
	

	if(showPal)
		drawPal();
}

function movetoTile(tile) {
	curStartTile = tile;
	refresh()
}


var playerCB = [	// collision boxes groups for 4 players
	0x100000,0x100C00,0x101800,0x102400
];

var animAddress = [
	0xAFE14, 0xAFF1E, 0xAFF50, 0xB011C, 0xAFD28, 0x49EE8, 0x9E6E2, 0x9931C, 0x5FEF8, 0x6486C, 0x60316
];
// show object animation from rom address
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
function loopDrawAnimation(addr) {
	animTimer = null;
	var bf = new bytebuffer(romFrameData, addr);
	

	bf.position(addr);

	bf.skip(4);
	let palette = bf.getuShort();
	bf.skip(4);
	let pidx = bf.getShort();
	bf.skip(2);
	let flag = bf.getShort();
	let offset = bf.getShort();

debugger
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	let frame = getRomFrame(addr);
	if(!frame) {
		return;
	}
	
	labelInfo.innerText = 'anim:' + addr.toString(16).toUpperCase();
	
	drawRomFrameBase(frame);
	addr = addr + offset * 2 + 0x12;
	if(flag < 0) {	// repeat
		addr = bf.getInt(addr);
	}
		animTimer = setTimeout("loopDrawAnimation("+ addr +")", 200);
}


function drawCB(bf, c = ctx, offx = 128, offy = 160) {
	let z = bf.getShort();
	let z2 = bf.getShort();
	let x = bf.getShort();
	let x2 = bf.getShort();
	let y = bf.getShort();
	let y2 = bf.getShort();
	c.strokeRect(x + offx, -y + offy, x2, -y2);
//	labelInfo.title = 'x=' + x + ',' + x2 + ' y=' + y + ',' + y2 + ' z=' + z + ',' + z2;
}


var mapAddress = 0x10DC70;

let mapWidth = 32;
let mapHeight;	// default 8
let mapGrid = 2;		// each map tile contains 4 raw tiles?

// draw a background with tilemap
function drawMap() {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	var bf3 = new bytebuffer(romFrameData);
	ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
	
	let tileindex = bf.getInt(mapAddress + curMap * 8);
	let tileaddr = bf.getInt(mapAddress + curMap * 8 + 4);
	let bigindex = bf.getInt(0x1DE0A + curMap * 4);
	
//	labelInfo.innerText = 'address:' + bf.position().toString(16).toUpperCase()
//			+ ' 2x2tile address:' + mapTileAddress[curMap].toString(16).toUpperCase();
	var imageData = ctxBack.createImageData(gridWidth, gridHeight);

	var height = 2;
	bf3.position(bigindex);
	
	let startscr=0;
//	for(let scr=0;scr<6 + mapAddressSkip * 2;scr++) {
	// let scenecount = bf3.getr(-2) / 2;
	// let scenelength = bf3.getr(-1);
	// labelInfo.innerHTML += ',size:' + scenecount+','+scenelength;
	// bf3.skip(mapAddressSkip * 2 * scenecount + mapScene * 2);
	bf3.skip(mapAddressSkip * 2);
	for(let scr=0;scr<2;scr++) {
		
		// if(scr%2==0 && scr > 0)
		// 	bf3.skip(2 * (scenecount-1))
		
		let scrTile = bf3.getShort();
//		if(scr<mapAddressSkip * 2)
//			continue;
//		
		let scrx = scr * 256;
		let scry = 0;
		// let scry = 256 - (scr & 1) * 256;//Math.floor(startscr / height) * 256;
		// let scrx = (scr >> 1) * 256;//(height - startscr % height - 1) * 256;

		bf.position(mapAddress + (scrTile << 10));
	
		for(let i=0;i<16;i++) {
			for(let j=0;j<16;j++) {
				// let maptile=bf.getShort();
				// bf2.position(maptile + tileaddr);
						
				let tile = bf.getShort() + 0x6800;debugger
				let flag = bf.get();
				let pal = bf.get();
				if(hideBackground) {	// hide background based on flag and color, 0x10 maybe the switch
					let hide = flag & 0xF;
					if((pal & 0x80) == 0)
						hide = 16;
					drawTilesBase(imageData, tile, 1, 1, (pal & 0x1F) + 0x40, 16, false, (pal & 0x40), (pal & 0x20), hide);
				} else 
					drawTilesBase(imageData, tile, 1, 1, (pal & 0x1F) + 0x40, 16, false, (pal & 0x40), (pal & 0x20));
				ctxBack.putImageData(imageData, scrx + (i)%32 * gridHeight, scry + (j) * gridWidth);
			}
		}
		// startscr++;
	}

}

var map2Address = 0xA9D4A;	// layer 2 background
function drawMap2() {
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	var bf3 = new bytebuffer(romFrameData);
	ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
	
	let tileindex = bf.getInt(map2Address + curMap * 8);
	let tileaddr = bf.getInt(map2Address + curMap * 8 + 4);
	let bigindex = bf.getInt(0xA9934 + curMap * 4);
	
//	labelInfo.innerText = 'address:' + bf.position().toString(16).toUpperCase()
//			+ ' 2x2tile address:' + mapTileAddress[curMap].toString(16).toUpperCase();
	var imageData = ctxBack.createImageData(gridWidth*2, gridHeight*2);

	var height = 2;
	bf3.position(bigindex);
	
	let startscr=0;
//	for(let scr=0;scr<6 + mapAddressSkip * 2;scr++) {
	let scenecount = bf3.getr(-2) / 2;
	let scenelength = bf3.getr(-1);
	labelInfo.innerHTML += ',size:' + scenecount+','+scenelength;
	bf3.skip(mapAddressSkip * 2 * scenecount + mapScene * 2);

	for(let scr=0;scr<4;scr++) {
		
		if(scr%2==0 && scr > 0)
			bf3.skip(2 * (scenecount-1))
		
		let scrTile = bf3.get();
//		if(scr<mapAddressSkip * 2)
//			continue;
//		

		let scry = 256 - (scr & 1) * 256;//Math.floor(startscr / height) * 256;
		let scrx = (scr >> 1) * 256;//(height - startscr % height - 1) * 256;

		bf.position(tileindex+scrTile * 16 * 2);
	
		for(let i=0;i<4;i++) {
			for(let j=0;j<4;j++) {
				let maptile=bf.getShort();
				bf2.position(maptile + tileaddr);
				for(let gi=0;gi<mapGrid;gi++)
					for(let gj=0;gj<mapGrid;gj++) {
						
						let tile = bf2.getShort();
						let flag = bf2.get();
						let pal = bf2.get();
						if(hideBackground) {	// hide background based on flag and color, 0x10 maybe the switch
							let hide = flag & 0xF;
							if((pal & 0x80) == 0)
								hide = 16;
							drawTilesBase(imageData, tile, 1, 1, (pal & 0x1F) + 0x60, 32, false, (pal & 0x40), (pal & 0x20), hide);
						} else 
							drawTilesBase(imageData, tile, 1, 1, (pal & 0x1F) + 0x60, 32, false, (pal & 0x40), (pal & 0x20));
						ctxBack.putImageData(imageData, scrx + (j*mapGrid+gj)%32 * gridHeight*2, scry + (i*mapGrid+gi) * gridWidth*2);
					}
			}
		}
		startscr++;
	}



}

function setMapTileStart(mapstart) {
	mapScene = mapstart;
	refresh();
}

function getCB(addr) {
	var bf = new bytebuffer(romFrameData, addr);
	return {
		z : bf.getShort(),
		z2 : bf.getShort(),
		x : bf.getShort(),
		x2 : bf.getShort(),
		y : bf.getShort(),
		y2 : bf.getShort(),
	}
}

frameAddress = [
	0xAFE14, 0x60002, 0x64976, 0x5FEf8, 0x99330 //0x14ec90, 0x13a22e, 0x151c94, 0x152c22, 0x1397ca, 0x151454, 0x10a696, 0x10bf0e, 0x11b1a2, 0x13e6fe
];

// get frame from addr. return a frame obj
function getRomFrame(addr, f){
	var bf = new bytebuffer(romFrameData);
	var bf2 = new bytebuffer(romFrameData);
	let positionTable = 0xCB016;
	
	let frame = {
			sprites : []
	};
	
	bf.position(addr);

	bf.skip(4);
	let flag = bf.getuShort();
	let palette = flag;
	bf.skip(4);
	let pidx = bf.getShort();
	bf.skip(4);
	let spriteNumber = bf.getShort();

	// let tileNumber = bf.getShort();
	// let spriteNumber = bf.getShort();
	// let flag = bf.get();
	// let palette = bf.get();
	// let pidx = bf.getShort();
	
	let pos = bf.getInt(positionTable + pidx);
	bf2.position(pos);
	frame.info = 'sprite:' + addr.toString(16).toUpperCase() + ' position:' + pos.toString(16).toUpperCase();
	let x = 0;
	let y = 0;
	
debugger

	for(let j = 0;j < spriteNumber;j++) {
		let nx = 0;
		let ny = 0;
		x += bf2.getShort();
		y += bf2.getShort();
		if(flag & 0x80) {
			let nxy = bf2.get();
			nx = nxy % 16;
			ny = nxy >> 4;
			palette = bf2.get();
		}
		let tile = bf.getShort();

		let sprite = {
			x : x,
			y : y,
			tile : tile,
			nx : nx + 1,
			ny : ny + 1,
			vflip : palette & 0x40,	// this tile need flip
			hflip : palette & 0x20,	// this tile need flip
			pal : palette & 0x1F,
		};

		frame.sprites.push(sprite);
//		console.log("tile: ", JSON.stringify(sprite));
	}
	return frame;
}

var animPlayerAddr = [];


function loadRomFrame() {
	var bf = new bytebuffer(romFrameData);
	
	for(let i = 0;i < 400;i++) {

		frameAddress.push(bf.getInt(0xA0AA0 + i * 4));	// read from animation and show first frame
		animAddress.push(bf.getInt(0xA0AA0 + i * 4));
	}
	
	

}



