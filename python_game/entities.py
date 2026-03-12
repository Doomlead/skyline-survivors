"""Entity and gameplay model layer for the standalone game."""

from __future__ import annotations

from dataclasses import dataclass
import math
import random

from . import config


@dataclass
class Vec2:
    x: float
    y: float

    def __add__(self, other: "Vec2") -> "Vec2":
        return Vec2(self.x + other.x, self.y + other.y)

    def __sub__(self, other: "Vec2") -> "Vec2":
        return Vec2(self.x - other.x, self.y - other.y)

    def scale(self, amount: float) -> "Vec2":
        return Vec2(self.x * amount, self.y * amount)

    def length(self) -> float:
        return math.hypot(self.x, self.y)

    def normalized(self) -> "Vec2":
        magnitude = self.length()
        if magnitude == 0:
            return Vec2(0.0, 0.0)
        return self.scale(1.0 / magnitude)


@dataclass
class Player:
    position: Vec2
    radius: float = 16.0
    health: int = config.PLAYER_MAX_HEALTH
    cooldown: float = 0.0


@dataclass
class Enemy:
    position: Vec2
    velocity: Vec2
    radius: float = 14.0
    health: int = config.ENEMY_HEALTH


@dataclass
class Projectile:
    position: Vec2
    velocity: Vec2
    radius: float = 5.0
    damage: int = config.PROJECTILE_DAMAGE


@dataclass
class Powerup:
    position: Vec2
    radius: float = config.POWERUP_RADIUS


@dataclass
class GameState:
    player: Player
    enemies: list[Enemy]
    projectiles: list[Projectile]
    powerups: list[Powerup]
    score: int
    wave: int
    game_over: bool


class GameModel:
    def __init__(self) -> None:
        self.state = GameState(
            player=Player(position=Vec2(config.WIDTH * 0.5, config.HEIGHT * 0.8)),
            enemies=[],
            projectiles=[],
            powerups=[],
            score=0,
            wave=1,
            game_over=False,
        )
        self.enemy_spawn_timer = 0.0
        self.powerup_spawn_timer = 0.0
        self.wave_timer = 0.0

    def move_player(self, axis_x: float, axis_y: float, dt: float) -> None:
        if self.state.game_over:
            return
        direction = Vec2(axis_x, axis_y)
        if direction.length() > 1:
            direction = direction.normalized()
        delta = direction.scale(config.PLAYER_SPEED * dt)
        next_pos = self.state.player.position + delta
        self.state.player.position = Vec2(
            min(max(next_pos.x, 16), config.WIDTH - 16),
            min(max(next_pos.y, 16), config.HEIGHT - 16),
        )

    def shoot_at(self, target_x: float, target_y: float) -> None:
        player = self.state.player
        if self.state.game_over or player.cooldown > 0:
            return

        direction = Vec2(target_x - player.position.x, target_y - player.position.y).normalized()
        if direction.length() == 0:
            direction = Vec2(0, -1)

        self.state.projectiles.append(
            Projectile(
                position=Vec2(player.position.x, player.position.y),
                velocity=direction.scale(config.PROJECTILE_SPEED),
            )
        )
        player.cooldown = config.PLAYER_SHOT_COOLDOWN

    def update(self, dt: float) -> None:
        if self.state.game_over:
            return

        player = self.state.player
        player.cooldown = max(0.0, player.cooldown - dt)

        self._update_wave(dt)
        self._spawn_enemies(dt)
        self._spawn_powerups(dt)
        self._update_projectiles(dt)
        self._update_enemies(dt)
        self._collect_powerups()
        self._resolve_enemy_player_collisions()

        if player.health <= 0:
            self.state.game_over = True

    def _update_wave(self, dt: float) -> None:
        self.wave_timer += dt
        if self.wave_timer >= config.WAVE_DURATION_SECONDS:
            self.wave_timer = 0.0
            self.state.wave += 1

    def _spawn_enemies(self, dt: float) -> None:
        self.enemy_spawn_timer += dt
        spawn_interval = max(0.2, config.ENEMY_SPAWN_INTERVAL - (self.state.wave - 1) * 0.08)
        if self.enemy_spawn_timer < spawn_interval:
            return
        self.enemy_spawn_timer = 0.0

        spawn_x = random.choice([random.uniform(0, config.WIDTH), random.choice([8.0, config.WIDTH - 8.0])])
        spawn_y = random.choice([8.0, config.HEIGHT - 8.0, random.uniform(0, config.HEIGHT * 0.35)])
        start = Vec2(spawn_x, spawn_y)
        direction = (self.state.player.position - start).normalized()
        speed = config.ENEMY_BASE_SPEED + self.state.wave * 10
        self.state.enemies.append(Enemy(position=start, velocity=direction.scale(speed)))

    def _spawn_powerups(self, dt: float) -> None:
        self.powerup_spawn_timer += dt
        if self.powerup_spawn_timer < config.POWERUP_INTERVAL:
            return
        self.powerup_spawn_timer = 0.0
        self.state.powerups.append(
            Powerup(
                position=Vec2(
                    random.uniform(36, config.WIDTH - 36),
                    random.uniform(36, config.HEIGHT - 36),
                )
            )
        )

    def _update_projectiles(self, dt: float) -> None:
        survivors: list[Projectile] = []
        for projectile in self.state.projectiles:
            projectile.position = projectile.position + projectile.velocity.scale(dt)
            if 0 <= projectile.position.x <= config.WIDTH and 0 <= projectile.position.y <= config.HEIGHT:
                survivors.append(projectile)
        self.state.projectiles = survivors

    def _update_enemies(self, dt: float) -> None:
        for enemy in self.state.enemies:
            direction = (self.state.player.position - enemy.position).normalized()
            enemy.velocity = direction.scale(config.ENEMY_BASE_SPEED + self.state.wave * 10)
            enemy.position = enemy.position + enemy.velocity.scale(dt)

        alive_enemies: list[Enemy] = []
        for enemy in self.state.enemies:
            dead = False
            for projectile in list(self.state.projectiles):
                if circles_overlap(enemy.position, enemy.radius, projectile.position, projectile.radius):
                    enemy.health -= projectile.damage
                    self.state.projectiles.remove(projectile)
                    if enemy.health <= 0:
                        self.state.score += 10
                        dead = True
                    break
            if not dead:
                alive_enemies.append(enemy)

        self.state.enemies = alive_enemies

    def _collect_powerups(self) -> None:
        player = self.state.player
        for powerup in list(self.state.powerups):
            if circles_overlap(player.position, player.radius, powerup.position, powerup.radius):
                player.health = min(config.PLAYER_MAX_HEALTH, player.health + config.POWERUP_HEAL_AMOUNT)
                self.state.powerups.remove(powerup)

    def _resolve_enemy_player_collisions(self) -> None:
        player = self.state.player
        for enemy in list(self.state.enemies):
            if circles_overlap(player.position, player.radius, enemy.position, enemy.radius):
                player.health -= config.ENEMY_DAMAGE
                self.state.enemies.remove(enemy)


def circles_overlap(a: Vec2, ar: float, b: Vec2, br: float) -> bool:
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 <= (ar + br) ** 2
