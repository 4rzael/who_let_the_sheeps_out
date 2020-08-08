import PhaserLogo from '../objects/phaserLogo'
import FpsText from '../objects/fpsText'

const FULL = 868
const HALF = FULL / 2

const NB_SHEEPS = 5
const SHEEP_SPRINT_SPEED = 512
const SHEEP_CRUISING_SPEED = 256
const PLAYER_SPEED = 1024
const SHEEP_DOESNT_CARE_THRESHOLD = 256
const SHEEP_MEMORY = 500
const MAX_TIME = 30

export default class MainScene extends Phaser.Scene {
  fpsText

  constructor() {
    super({ key: 'MainScene' })
  }

  create () {
    this.fond = this.physics.add.sprite(FULL,FULL,'fond');
    this.fond.setPosition(0,0)
    this.fond.setCollideWorldBounds(true)
    this.player = this.physics.add.sprite(128, 128, 'dog');
    this.player.setCollideWorldBounds(true)

    this.player.setPosition(10, 10)
    this.playerSpeed = 512

    this.sheepScore = NB_SHEEPS
    this.time = MAX_TIME

    this.keys = this.input.keyboard.addKeys({
      up: 'up',
      down: 'down',
      left: 'left',
      right: 'right'
    })

    this.sheeps = []
    for (let i = 0; i < NB_SHEEPS; ++i) {
      const sheep = this.physics.add.sprite(128, 128, 'sheep')
      sheep.setRandomPosition(HALF / 2, HALF / 2, HALF / 2, HALF / 2)
      sheep.enableBody = true

      const sheepObj = {
        sprite: sheep,
        cruising_direction: [0,0]
      }

      setInterval(() => {
        const angle = Math.random() * 2 * 3.14
        sheepObj.cruising_direction = [Math.cos(angle), Math.sin(angle)]
      }, SHEEP_MEMORY)

      this.sheeps.push(sheepObj)
    }

    this.timeText = this.add.text(FULL - 200, 50, `Time left: ${this.time}`, {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      color: '#000000',
      fontSize: 32});
    this.scoreText = this.add.text(50, 50, `Sheeps alive: ${this.sheepScore}`, {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      color: '#000000',
      fontSize: 32});

    this.explain = this.add.text(200, HALF, `DON'T LET THE SHEEPS RUN AWAY`, {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      color: '#b22c2e',
      fontSize: 32});

    setTimeout(() => {
      this.explain.destroy()
    }, 5000)

      setInterval(() => {
      this.time -= 1
      this.timeText.text = `Time left: ${this.time}`
    }, 1000) 
  }

  update () {
    this.handleControls()
    this.sheeps = this.sheeps.filter((sheep) => {
      this.handleSheepReactions(sheep)
      const pos = [sheep.sprite.x, sheep.sprite.y]
      if (pos[0] < 0 || pos[0] >= FULL || pos[1] < 0 || pos[1] >= FULL) {
        sheep.sprite.setActive(false)
        sheep.sprite.setPosition(FULL * 2, FULL * 2)
        return false
      }
      return true
    })
    this.sheepScore = this.sheeps.length
    this.scoreText.text = `Sheeps alive: ${this.sheepScore}`
    
    if (this.sheepScore <= 0) {
      this.scene.start('LostScene')
    }
    if (this.time <= 0) {
      this.scene.start('WonScene')
    }
  }

  handleSheepReactions (sheep) {
    const playerPos = [this.player.x, this.player.y]
    const pos = [sheep.sprite.x, sheep.sprite.y]

    const dist = Math.sqrt(Math.pow(playerPos[0] - pos[0], 2) + Math.pow(playerPos[1] - pos[1], 2))

    if (dist > SHEEP_DOESNT_CARE_THRESHOLD) {
      sheep.sprite.setVelocityX(sheep.cruising_direction[0] * SHEEP_CRUISING_SPEED)
      sheep.sprite.setVelocityY(sheep.cruising_direction[1] * SHEEP_CRUISING_SPEED)
    } else {
      let direction = [pos[0] - playerPos[0], pos[1] - playerPos[1]]
      direction[0] = (direction[0] / dist) * SHEEP_SPRINT_SPEED
      direction[1] = (direction[1] / dist) * SHEEP_SPRINT_SPEED
      sheep.sprite.setVelocityX(direction[0])
      sheep.sprite.setVelocityY(direction[1])
    }
  }

  handleControls () {
    if (this.keys.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed)
    }
    else if (this.keys.down.isDown) {
      this.player.setVelocityY(this.playerSpeed)
    } else {
      this.player.setVelocityY(0)
    }
    if (this.keys.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed)
    }
    else if (this.keys.right.isDown) {
      this.player.setVelocityX(this.playerSpeed)
    } else {
      this.player.setVelocityX(0)
    }
  }
}
