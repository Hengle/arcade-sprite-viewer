# arcade-sprite-viewer
An arcade game sprite / map viewer (cps1 neogeo ...)

![punisher animation](https://raw.githubusercontent.com/bombzj/arcade-sprite-viewer/master/res/punisheranim.gif)<br/>
![punisher background](https://raw.githubusercontent.com/bombzj/arcade-sprite-viewer/master/res/punishermap.png)<br/>

* Click [here](https://bombzj.github.io/arcade-sprite-viewer/) to view `punisher`.

![1945ii animation](https://raw.githubusercontent.com/bombzj/arcade-sprite-viewer/master/res/anim1945ii.gif)<br/>
![1945ii background](https://raw.githubusercontent.com/bombzj/arcade-sprite-viewer/master/res/map1945ii.png)<br/>

* Click [here](https://bombzj.github.io/arcade-sprite-viewer/?1945ii) to view `strikers 1945ii`.

## control
* m = change mode from 1 - 6 loop
* ctrl + arrow keys = change palette set to level/scene
* mode 1 (tiles)
  * arrow keys/page up/down = move tiles
  * \[ / \] change tile set
  * , / . change palette
* mode 2 (sprites)
  * arrow up/down = change set of sprites
  * arrow left/right = change sprite
* mode 3/4 (background layer)
  * arrow up/down = change level
  * arrow left/right = change scene of level
  * , / . = move map left/right
  * c show collision box (if found)
* mode 5 (player animation) unfinished
* mode 6 (animation) if any
  * arrow up/down = change set of animations
  * arrow left/right = change animation

## TODO
* neogeo
* webgl & wasm?
* more games
* how to know which pen/color of background layer is in front of sprites?

## Reference
* [Capcom System 1](https://patpend.net/technical/arcade/cps1.html)
* [NeoGeo Sprite graphics format](https://wiki.neogeodev.org/index.php?title=Sprite_graphics_format)

## Thanks to
Project [mamedev](https://github.com/mamedev/mame)<br/>
Phil Bennett